'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, SlidersHorizontal } from 'lucide-react';
import ProductCard from './ProductCard';
import { categories } from '@/data/products';

const sortOptions = [
  { label: 'Mais Recentes', value: 'recent' },
  { label: 'Menor Preço', value: 'asc' },
  { label: 'Maior Preço', value: 'desc' },
  { label: 'Destaque', value: 'hot' },
];

import { useAdmin } from '@/store/useAdmin';
import { useEffect } from 'react';

export default function ProductGrid() {
  const { products: storeProducts, loadProducts, subscribe } = useAdmin();
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState('recent');
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    loadProducts();
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, []);

  const filtered = activeCategory === 'Todos' 
    ? storeProducts 
    : storeProducts.filter(p => p.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'asc') return a.price - b.price;
    if (sortBy === 'desc') return b.price - a.price;
    // For 'recent', we can use created_at if available, otherwise index/id
    if (sortBy === 'recent') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    return 0;
  });

  return (
    <section id="produtos" className="relative py-24 px-4 sm:px-6 lg:px-8">
      {/* Section background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #FF450055, transparent)' }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap size={14} fill="#FF4500" stroke="none" />
            <span
              className="text-[11px] tracking-[0.4em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace", color: '#FF4500' }}
            >
              Coleção Atual
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2
              className="text-[clamp(2.5rem,8vw,5.5rem)] leading-none"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
            >
              <span
                style={{
                  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                OS
              </span>{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #FF0000, #FF4500, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 20px rgba(255,34,0,0.4))',
                }}
              >
                DROPS
              </span>
            </h2>

            {/* Sort Button */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="btn-outline-fire flex items-center gap-2 px-4 py-2.5"
                style={{
                  fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  borderRadius: '2px',
                }}
              >
                <SlidersHorizontal size={12} className="text-fire-orange" />
                <span className="text-white/70 uppercase">
                  {sortOptions.find((s) => s.value === sortBy)?.label}
                </span>
              </button>

              <AnimatePresence>
                {showSort && (
                  <motion.ul
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-44 glass-card border border-white/[0.08] z-20 overflow-hidden"
                    style={{ borderRadius: '2px' }}
                  >
                    {sortOptions.map((opt) => (
                      <li key={opt.value}>
                        <button
                          onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                          className={`w-full text-left px-4 py-3 text-[12px] tracking-wider uppercase transition-colors duration-200 ${
                            sortBy === opt.value
                              ? 'text-fire-orange bg-fire-orange/10'
                              : 'text-white/50 hover:text-white hover:bg-white/5'
                          }`}
                          style={{ fontFamily: "'Space Mono', monospace" }}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Category filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-2 flex-wrap mb-10 pb-6 border-b border-white/[0.05]"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-fire-gradient text-black font-bold shadow-fire-md'
                  : 'border border-white/10 text-white/40 hover:text-white hover:border-white/25 bg-white/[0.02]'
              }`}
              style={{
                fontFamily: "'Space Mono', monospace",
                borderRadius: '1px',
              }}
            >
              {cat}
            </motion.button>
          ))}

          <span className="ml-auto text-[10px] text-white/20 font-mono" style={{ fontFamily: "'Space Mono', monospace" }}>
            {sorted.length} produto{sorted.length !== 1 ? 's' : ''}
          </span>
        </motion.div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + sortBy}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {sorted.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p
            className="text-white/20 text-sm mb-4"
            style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}
          >
            Novos drops toda semana. Fique ligado.
          </p>
          <motion.a
            href="#"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/10
                       text-white/40 hover:text-white hover:border-white/20 transition-all duration-300 text-sm uppercase"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              borderRadius: '1px',
            }}
          >
            Ver Todos os Produtos
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
