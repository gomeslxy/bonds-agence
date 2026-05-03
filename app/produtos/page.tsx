import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/CartSidebar';
import { createClient } from '@/lib/supabase/server';
import { type Product } from '@/data/products';

export const revalidate = 60; // ISR cache

export const metadata: Metadata = {
  title: 'Coleção Completa',
  description: 'Explore nossa coleção completa de streetwear e sportlife. Corta-ventos, conjuntos, kits refletivos e muito mais na Bonds Agence.',
  openGraph: {
    title: 'Coleção Completa | Bonds Agence',
    description: 'Explore nossa coleção completa de streetwear e sportlife. Corta-ventos, conjuntos, kits refletivos e muito mais na Bonds Agence.',
  },
};

const ProductGrid = dynamic(() => import('@/components/ProductGrid'), { ssr: true });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: true });

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  const products = (data || []).map(p => ({
    ...p,
    price: Number(p.price || 0),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    colors: (p.colors || []).map((c: any) => {
      if (typeof c !== 'string') return c;
      const [name, hex] = c.split('|');
      return { name: name || 'Padrão', hex: hex || '#000000' };
    }),
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    features: Array.isArray(p.features) ? p.features : [],
    subtitle: p.subtitle || '',
    stock: Number(p.stock || 0),
  })) as Product[];

  return (
    <main className="relative min-h-screen">
      <CartSidebar />
      <Navbar />
      
      <div className="pt-20">
        <ProductGrid initialProducts={products} />
      </div>

      <Footer />
    </main>
  );
}
