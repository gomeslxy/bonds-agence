'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, ShoppingBag, Zap, Shield, RefreshCw,
  Truck, ChevronDown, Star, Flame,
} from 'lucide-react';
import { getProductById, products, type Product } from '@/data/products';
import { useCart } from '@/store/useCart';
import { supabase } from '@/lib/supabase';
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
  'Forro Polar':    <Flame size={12} />,
  'Dri-Fit Pro':    <Zap size={12} />,
  default:          <Zap size={12} />,
};

/* ─── Related Products strip ───────────────────────────── */
function RelatedStrip({ currentId }: { currentId: string }) {
  const related = products.filter((p) => p.id !== currentId).slice(0, 3);
  return (
    <section className="mt-24 border-t border-white/[0.05] pt-16">
      <h3
        className="text-3xl mb-8"
        style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
      >
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>VOCÊ</span>{' '}
        <span style={{
          background: 'linear-gradient(135deg, #FF0000, #FF4500, #FFA500)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>TAMBÉM VAI</span>{' '}
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>QUERER</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={`/product/${p.id}`} className="group block">
              <div
                className="relative overflow-hidden aspect-[4/3] mb-3"
                style={{ background: '#0d0d0d', borderRadius: '3px' }}
              >
                <Image src={p.image} alt={p.name} fill className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ background: 'linear-gradient(135deg, rgba(255,69,0,0.1), transparent)' }} />
              </div>
              <p className="text-xs text-white/30 tracking-widest uppercase mb-1"
                 style={{ fontFamily: "'Space Mono', monospace" }}>{p.category}</p>
              <h4 className="text-lg text-white group-hover:text-fire-amber transition-colors"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.06em' }}>{p.name}</h4>
              <p className="text-sm mt-1"
                 style={{
                   fontFamily: "'Bebas Neue', Impact, sans-serif",
                   background: 'linear-gradient(135deg, #FF4500, #FFA500)',
                   WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                 }}>
                {fmt(p.price)}
              </p>
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

  useEffect(() => {
    async function fetchProduct() {
      const p = getProductById(params.id);
      if (p) {
        setProduct(p);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('products').select('*').eq('id', params.id).single();
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

  const discount = product && product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

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
    fireToast('Adicionado ao carrinho!', `${product.name} · ${selectedSize}`, 'cart');
    await new Promise((r) => setTimeout(r, 1200));
    setAdding(false);
  };

  // Keyboard shortcut: left/right arrow for gallery
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActiveImg((i) => (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft')  setActiveImg((i) => (i - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gallery.length]);

  if (loading) return <div className="min-h-screen bg-white dark:bg-black" />;
  if (!product) return notFound();

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <CartSidebar />

      {/* ── Hero image backdrop (blurred) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Image src={product.image} alt="" fill className="object-cover object-top scale-110 blur-3xl opacity-[0.04]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* Back nav */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors mb-10 group font-mono text-[0.7rem] tracking-[0.2em]"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            VOLTAR AOS DROPS
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* ══ LEFT — Image Gallery ══ */}
          <div className="space-y-4">
            {/* Main image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden aspect-[3/4] group bg-black/5 dark:bg-[#0d0d0d] rounded-[4px] border border-black/10 dark:border-white/[0.05]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={gallery[activeImg]}
                    alt={product.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Gradient overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 dark:from-black/80 via-transparent to-transparent" />

              {/* Tag */}
              {product.tag && (
                <div className="absolute top-4 left-4 clip-badge px-3 py-1"
                     style={{ background: product.tagColor ?? '#FF0000' }}>
                  <span className="text-[10px] font-bold text-black tracking-widest font-mono">
                    {product.tag}
                  </span>
                </div>
              )}

              {/* Arrow nav overlay */}
              <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => setActiveImg((i) => (i - 1 + gallery.length) % gallery.length)}
                        className="w-8 h-8 flex items-center justify-center bg-black/60 border border-white/10 text-white/60 hover:text-white backdrop-blur-sm"
                        style={{ borderRadius: '2px' }}>
                  <ArrowLeft size={14} />
                </button>
                <button onClick={() => setActiveImg((i) => (i + 1) % gallery.length)}
                        className="w-8 h-8 flex items-center justify-center bg-black/60 border border-white/10 text-white/60 hover:text-white backdrop-blur-sm rotate-180"
                        style={{ borderRadius: '2px' }}>
                  <ArrowLeft size={14} />
                </button>
              </div>
            </motion.div>

            {/* Thumbnail strip */}
            <div className="flex gap-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative overflow-hidden flex-1 aspect-square transition-all duration-200 rounded-[3px] border ${
                    activeImg === i ? 'border-fire-orange drop-shadow-fire-sm' : 'border-black/10 dark:border-white/[0.07]'
                  }`}
                >
                  <Image src={img} alt={`Vista ${i + 1}`} fill className="object-cover object-top" />
                  {activeImg !== i && <div className="absolute inset-0 bg-black/10 dark:bg-black/40" />}
                </button>
              ))}
            </div>
          </div>

          {/* ══ RIGHT — Product Details ══ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            {/* Category + rating */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.35em] uppercase font-mono text-fire-orange">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className={i < 4 ? 'text-fire-amber fill-fire-amber' : 'text-black/10 dark:text-white/20 fill-transparent'} stroke="currentColor" />
                ))}
                <span className="text-[10px] text-black/40 dark:text-white/20 ml-1 font-mono">(127)</span>
              </div>
            </div>

            {/* Name */}
            <div>
              <h1 className="leading-none font-display text-[clamp(2.5rem,6vw,4.5rem)] tracking-[0.04em]">
                <span className="text-black/90 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-white/70">
                  {product.name}
                </span>
              </h1>
              <p className="mt-2 text-black/50 dark:text-white/40 font-body text-[1rem]">
                {product.subtitle}
              </p>
            </div>

            {/* Price block */}
            <div className="flex items-end gap-4">
              <span className="font-display text-[2.8rem] tracking-[0.03em] leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#FF0000] via-[#FF4500] to-[#FFA500] drop-shadow-[0_0_16px_rgba(255,34,0,0.35)]">
                {fmt(product.price)}
              </span>
              {product.originalPrice && (
                <div className="pb-1">
                  <span className="text-black/30 dark:text-white/25 line-through text-lg font-mono">
                    {fmt(product.originalPrice)}
                  </span>
                  <span className="ml-2 text-xs px-2 py-0.5 font-mono text-fire-orange bg-fire-orange/10 border border-fire-orange/30 rounded-sm">
                    -{discount}%
                  </span>
                </div>
              )}
            </div>

            {/* Installments note */}
            <p className="text-xs text-black/40 dark:text-white/25 -mt-3 font-mono">
              ou 12x de {fmt(product.price / 12)} sem juros
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-fire-orange/20 via-black/5 dark:via-white/[0.04] to-transparent" />

            {/* Color selector */}
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-3 text-black/50 dark:text-white/40 font-mono">
                Cor — <span className="text-black/80 dark:text-white/70">{product.colors[selectedColor]?.name}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((c, i) => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedColor(i)}
                    title={c.name}
                    className={`w-8 h-8 transition-all duration-200 rounded-sm ${
                      selectedColor === i ? 'border-2 border-fire-orange scale-110 drop-shadow-fire-sm' : 'border-2 border-black/10 dark:border-white/10 scale-100'
                    }`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] tracking-[0.25em] uppercase text-black/50 dark:text-white/40 font-mono">
                  Tamanho — <span className="text-black/80 dark:text-white/70">{selectedSize}</span>
                </p>
                <button className="text-[10px] underline text-black/40 dark:text-white/20 hover:text-black/70 dark:hover:text-white/50 transition-colors font-mono">
                  Guia de Tamanhos
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <motion.button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`min-w-[52px] py-2.5 text-center text-[11px] font-bold transition-all duration-200 font-mono rounded-sm ${
                        isSelected ? 'border border-fire-orange bg-fire-orange/10 text-fire-orange drop-shadow-fire-sm' : 'border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] text-black/50 dark:text-white/40'
                      }`}
                    >
                      {sz}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Qty + CTA */}
            <div className="flex gap-3">
              {/* Qty control */}
              <div className="flex items-center border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] rounded-sm">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-10 h-full flex items-center justify-center text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors text-lg">
                  −
                </button>
                <span className="w-10 text-center text-sm text-black dark:text-white font-mono">
                  {qty}
                </span>
                <button onClick={() => setQty((q) => q + 1)}
                        className="w-10 h-full flex items-center justify-center text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors text-lg">
                  +
                </button>
              </div>

              {/* Add to cart CTA */}
              <motion.button
                onClick={handleAdd}
                disabled={adding}
                whileHover={{ scale: adding ? 1 : 1.02, y: adding ? 0 : -1 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-3 py-4 font-body font-extrabold uppercase tracking-[0.18em] text-[0.95rem] rounded-sm relative overflow-hidden text-black ${
                  adding ? 'bg-gradient-to-br from-[#FF4500] to-[#FF0000] drop-shadow-fire-md' : 'bg-gradient-to-br from-[#FF0000] via-[#FF4500] to-[#FFA500]'
                }`}
              >
                {/* Shimmer */}
                {!adding && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  />
                )}
                {adding ? (
                  <>
                    <Zap size={16} fill="black" stroke="none" />
                    <span className="text-black">Adicionado!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} className="text-black relative z-10" />
                    <span className="text-black relative z-10">Adicionar ao Carrinho</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: <Truck size={13} />, label: 'Frete Grátis', sub: 'acima de R$299' },
                { icon: <RefreshCw size={13} />, label: 'Troca Grátis', sub: 'em 30 dias' },
                { icon: <Shield size={13} />, label: 'Compra Segura', sub: '100% protegida' },
              ].map((b) => (
                <div key={b.label}
                     className="flex flex-col items-center gap-1 py-3 text-center border border-black/5 dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02] rounded-sm">
                  <span className="text-fire-orange">{b.icon}</span>
                  <span className="text-[10px] text-black/70 dark:text-white/60 leading-tight font-body font-bold">
                    {b.label}
                  </span>
                  <span className="text-[9px] text-black/40 dark:text-white/20 font-mono">
                    {b.sub}
                  </span>
                </div>
              ))}
            </div>

            {/* Collapsible description */}
            <div className="border border-black/10 dark:border-white/[0.05] rounded-sm">
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-xs tracking-[0.2em] uppercase text-black/60 dark:text-white/50 font-mono">
                  Detalhes do Produto
                </span>
                <motion.span animate={{ rotate: detailsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} className="text-black/40 dark:text-white/30" />
                </motion.span>
              </button>

              <AnimatePresence>
                {detailsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-black/10 dark:border-white/[0.05]">
                      <p className="text-sm text-black/60 dark:text-white/40 leading-relaxed pt-3 font-body font-light">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.features.map((f) => (
                          <span key={f}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-wider font-mono bg-fire-orange/10 border border-fire-orange/30 text-fire-orange rounded-sm"
                          >
                            {FEATURE_ICONS[f] ?? FEATURE_ICONS.default}
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stock indicator */}
            {product.stock <= 30 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-sm"
              >
                <motion.div
                  className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span className="text-[10px] text-red-500/80 font-mono">
                  Apenas {product.stock} unidades em estoque!
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Related products */}
        <RelatedStrip currentId={product.id} />
      </div>
    </main>
  );
}
