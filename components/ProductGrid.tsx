'use client';

import { useState, useMemo, useEffect } from 'react';
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

  const filtered = useMemo(() => activeCategory === 'Todos' 
    ? storeProducts 
    : storeProducts.filter(p => p.category === activeCategory), [activeCategory, storeProducts]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'asc') return a.price - b.price;
      if (sortBy === 'desc') return b.price - a.price;
      // For 'recent', we can use created_at if available, otherwise index/id
      if (sortBy === 'recent') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return 0;
    });
  }, [filtered, sortBy]);

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
            <Zap size={14} className="text-fire-orange fill-fire-orange" stroke="none" />
            <span
              className="text-[11px] font-mono tracking-[0.4em] uppercase text-fire-orange"
            >
              Coleção Atual
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2
              className="text-[clamp(2.5rem,8vw,5.5rem)] font-display leading-none"
            >
              <span
                className="bg-gradient-to-br from-black/80 to-black/30 dark:from-white dark:to-white/50 bg-clip-text text-transparent"
              >
                OS
              </span>{' '}
              <span
                className="text-fire-glow"
              >
                DROPS
              </span>
            </h2>

            {/* Sort Button */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="btn-outline-fire flex items-center gap-2 px-4 py-2.5 font-body font-semibold text-[0.8rem] tracking-[0.1em] rounded-sm"
              >
                <SlidersHorizontal size={12} className="text-fire-orange" />
                <span className="text-black/70 dark:text-white/70 uppercase">
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
                    className="absolute right-0 top-full mt-2 w-44 glass-card border border-black/5 dark:border-white/[0.08] z-20 overflow-hidden rounded-sm"
                  >
                    {sortOptions.map((opt) => (
                      <li key={opt.value}>
                        <button
                          onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                          className={`w-full text-left px-4 py-3 text-[12px] font-mono tracking-wider uppercase transition-colors duration-200 ${
                            sortBy === opt.value
                              ? 'text-fire-orange bg-fire-orange/10'
                              : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
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
          className="flex items-center gap-2 flex-wrap mb-10 pb-6 border-b border-black/[0.05] dark:border-white/[0.05]"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2 text-[11px] font-mono tracking-[0.15em] uppercase rounded-sm transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-fire-gradient text-black font-bold shadow-fire-md'
                  : 'border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black/25 dark:hover:border-white/25 bg-black/[0.02] dark:bg-white/[0.02]'
              }`}
            >
              {cat}
            </motion.button>
          ))}

          <span className="ml-auto text-[10px] text-black/40 dark:text-white/20 font-mono">
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
            className="text-black/40 dark:text-white/20 font-body text-sm mb-4"
          >
            Novos drops toda semana. Fique ligado.
          </p>
          <motion.a
            href="#"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 border border-black/10 dark:border-white/10
                       text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 font-mono text-[0.7rem] uppercase tracking-[0.25em] rounded-sm"
          >
            Ver Todos os Produtos
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
