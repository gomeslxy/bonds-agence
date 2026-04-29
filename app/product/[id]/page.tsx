'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, ShoppingBag, Shield, RefreshCw,
  Truck, ChevronDown, Star, Zap, Info
} from 'lucide-react';
import { getProductById, products, type Product } from '@/data/products';
import { useCart } from '@/store/useCart';
import { createClient } from '@/lib/supabase/client';
import { fireToast } from '@/components/ToastVFX';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/CartSidebar';

/* ─── Extra gallery images (simulated) ─────────────────── */
const GALLERY_EXTRAS = [
  'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=800&q=85',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85',
];

const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ─── Feature pills ────────────────────────────────────── */
const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'Refletivo 360°': <Shield size={12} />,
  'Impermeável':    <Shield size={12} />,
  'Anti-vento':     <Zap size={12} />,
  'Forro Polar':    <Info size={12} />,
  'Dri-Fit Pro':    <Zap size={12} />,
  default:          <Zap size={12} />,
};

/* ─── Related Products strip ───────────────────────────── */
function RelatedStrip({ currentId }: { currentId: string }) {
  const related = products.filter((p) => p.id !== currentId).slice(0, 3);
  return (
    <section className="mt-40 border-t border-white/5 pt-24">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-2xl font-bold tracking-tight uppercase italic">
          <span className="text-white/20">Recommended</span> <span className="text-white">Drops</span>
        </h3>
        <Link href="/produtos" className="text-[10px] font-mono tracking-[0.3em] text-white/30 hover:text-white transition-colors uppercase">
          View All Products
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {related.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={`/product/${p.id}`} className="group block">
              <div className="relative overflow-hidden aspect-[3/4] mb-6 bg-white/5 border border-white/5">
                <Image src={p.image} alt={p.name} fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-[10px] text-white/30 tracking-[0.3em] uppercase font-mono mb-2">{p.category}</p>
              <h4 className="text-sm font-bold uppercase tracking-tight mb-2">{p.name}</h4>
              <p className="text-sm font-mono text-white/60">{fmt(p.price)}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────────── */
export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const clientSupabase = createClient();

  useEffect(() => {
    async function fetchProduct() {
      const p = getProductById(params.id);
      if (p) {
        setProduct(p);
        setLoading(false);
        return;
      }
      const { data, error } = await clientSupabase.from('products').select('*').eq('id', params.id).single();
      if (data && !error) {
        const mapped = {
          ...data,
          colors: (data.colors || []).map((c: string) => {
            const [name, hex] = c.split('|');
            return { name: name || 'Padrão', hex: hex || '#000000' };
          }),
          sizes: data.sizes || [],
          features: data.features || [],
          subtitle: data.subtitle || '',
          stock: data.stock || 0,
        } as Product;
        setProduct(mapped);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [params.id]);

  const [activeImg, setActiveImg]     = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);

  useEffect(() => {
    if (product && product.sizes && !selectedSize) {
      setSelectedSize(product.sizes[1] ?? product.sizes[0]);
    }
  }, [product, selectedSize]);

  const [qty, setQty]                 = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adding, setAdding]           = useState(false);

  const { addItem } = useCart();
  const gallery = product ? [product.image, ...GALLERY_EXTRAS.slice(0, 2)] : [];

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: product.colors[selectedColor]?.name ?? '',
      category: product.category,
    });
    fireToast('Added to cart!', `${product.name} · ${selectedSize}`, 'cart');
    await new Promise((r) => setTimeout(r, 1000));
    setAdding(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActiveImg((i) => (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft')  setActiveImg((i) => (i - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gallery.length]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/5 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!product) return notFound();

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />
      <CartSidebar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-40">

        {/* Navigation */}
        <div className="flex items-center justify-between mb-16">
          <Link href="/produtos" className="flex items-center gap-3 text-[10px] font-mono tracking-[0.3em] text-white/30 hover:text-white transition-colors uppercase">
            <ArrowLeft size={12} /> Back to Collection
          </Link>
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-[0.2em] text-white/10 uppercase">
            <span>Home</span>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-white/40">{product.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">

          {/* ══ LEFT — Gallery ══ */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden aspect-[4/5] bg-white/5 border border-white/5"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image src={gallery[activeImg]} alt={product.name} fill className="object-cover object-top" priority />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-8 left-8 flex flex-col gap-2">
                {product.tag && (
                  <span className="px-4 py-1.5 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase">
                    {product.tag}
                  </span>
                )}
                {product.stock <= 15 && (
                  <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold tracking-[0.2em] uppercase border border-white/10">
                    Limited Supply
                  </span>
                )}
              </div>
            </motion.div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-4">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-[3/4] bg-white/5 border transition-all duration-500 ${
                    activeImg === i ? 'border-white opacity-100' : 'border-white/5 opacity-40 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover object-top" />
                </button>
              ))}
            </div>
          </div>

          {/* ══ RIGHT — Details ══ */}
          <div className="lg:col-span-5 flex flex-col space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <p className="text-[10px] font-mono tracking-[0.4em] text-white/30 uppercase">{product.category}</p>
                <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold leading-none tracking-tight uppercase italic">{product.name}</h1>
                <p className="text-white/40 text-sm tracking-wide max-w-sm">{product.subtitle}</p>
              </div>

              <div className="flex items-baseline gap-6">
                <span className="text-4xl font-bold tracking-tight">{fmt(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-white/20 line-through font-mono">{fmt(product.originalPrice)}</span>
                )}
              </div>
            </motion.div>

            <div className="h-px bg-white/10" />

            {/* Selection */}
            <div className="space-y-10">
              {/* Colors */}
              <div>
                <p className="text-[9px] font-mono tracking-[0.4em] text-white/30 uppercase mb-4">
                  Color / <span className="text-white">{product.colors[selectedColor]?.name}</span>
                </p>
                <div className="flex gap-4">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.hex}
                      onClick={() => setSelectedColor(i)}
                      className={`w-10 h-10 border transition-all duration-300 p-0.5 ${
                        selectedColor === i ? 'border-white' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="w-full h-full" style={{ background: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[9px] font-mono tracking-[0.4em] text-white/30 uppercase">
                    Select Size
                  </p>
                  <button className="text-[9px] font-mono tracking-[0.2em] text-white/20 hover:text-white uppercase transition-colors">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-4 text-[10px] font-bold border transition-all duration-300 ${
                        selectedSize === sz 
                          ? 'bg-white text-black border-white' 
                          : 'bg-transparent text-white/40 border-white/10 hover:border-white/40'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Add */}
              <div className="flex gap-4">
                <div className="flex items-center border border-white/10">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-12 h-full flex items-center justify-center text-white/30 hover:text-white transition-colors">−</button>
                  <span className="w-10 text-center text-xs font-bold font-mono">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-12 h-full flex items-center justify-center text-white/30 hover:text-white transition-colors">+</button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="flex-1 btn-premium py-6"
                >
                  {adding ? 'PROCESSING...' : 'ADD TO CART'}
                </button>
              </div>
            </div>

            {/* Features Accordion */}
            <div className="space-y-4 pt-12 border-t border-white/10">
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full flex items-center justify-between group"
              >
                <span className="text-[10px] font-mono tracking-[0.3em] text-white/40 group-hover:text-white transition-colors uppercase">Product Specifications</span>
                <ChevronDown size={14} className={`text-white/20 transition-transform duration-300 ${detailsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {detailsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-6"
                  >
                    <p className="text-sm text-white/40 leading-relaxed font-light">{product.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {product.features.map((f) => (
                        <div key={f} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5">
                          <span className="text-white/40">{FEATURE_ICONS[f] ?? FEATURE_ICONS.default}</span>
                          <span className="text-[10px] font-mono tracking-wider text-white/60 uppercase">{f}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-white/10">
              {[
                { icon: <Truck size={16} />, label: 'Standard Shipping', sub: 'Global Delivery' },
                { icon: <RefreshCw size={16} />, label: '30-Day Returns', sub: 'Hassle Free' },
                { icon: <Shield size={16} />, label: 'Verified Security', sub: '100% Protected' },
              ].map((b) => (
                <div key={b.label} className="space-y-2">
                  <div className="text-white/20">{b.icon}</div>
                  <p className="text-[10px] font-bold uppercase tracking-tight">{b.label}</p>
                  <p className="text-[9px] font-mono text-white/20 uppercase">{b.sub}</p>
                </div>
              ))}
            </div>

            {/* Stock indicator */}
            {product.stock <= 20 && (
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                  Low Stock: {product.stock} units remaining
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        <RelatedStrip currentId={product.id} />
      </div>
    </main>
  );
}
