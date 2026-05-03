import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { type Product } from '@/data/products';
import { createClient } from '@/lib/supabase/server';
import ProductClient from './ProductClient';

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    
    if (data && !error) {
      // Fetch size-specific stock
      const { data: stockData } = await supabase
        .from('product_stock')
        .select('size, quantity')
        .eq('product_id', id);

      return {
        ...data,
        colors: (data.colors || []).map((c: string) => {
          const [name, hex] = c.split('|');
          return { name: name || 'Padrão', hex: hex || '#000000' };
        }),
        sizes: data.sizes || [],
        features: data.features || [],
        subtitle: data.subtitle || '',
        stock: data.stock || 0,
        sizeStock: stockData || [],
      } as Product;
    }
  } catch (e) {
    console.error('Error fetching product from Supabase:', e);
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: 'Produto não encontrado' };

  const url = `https://bonds-agence.vercel.app/product/${product.id}`;
  
  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} | Bonds Agence`,
      description: product.description,
      url,
      images: [{ url: product.image }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Bonds Agence`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return notFound();

  // Fetch real related products from the same category
  const supabase = await createClient();
  const { data: relatedData } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(3);

  const relatedProducts = (relatedData || []).map(p => ({
    ...p,
    price: Number(p.price || 0),
    sizes: p.sizes || [],
    features: p.features || [],
  })) as Product[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Bonds Agence',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BRL',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://bonds-agence.vercel.app/product/${product.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
