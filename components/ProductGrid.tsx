'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ArrowDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { categories } from '@/data/products';
import { useAdmin } from '@/store/useAdmin';

const sortOptions = [
  { label: 'Recentes', value: 'recent' },
  { label: 'Menor Preço', value: 'asc' },
  { label: 'Maior Preço', value: 'desc' },
];

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
      if (sortBy === 'recent') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return 0;
    });
  }, [filtered, sortBy]);

  return (
    <section id="produtos" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-px bg-white/20" />
            <span className="text-[10px] font-mono tracking-[0.5em] text-white/40 uppercase">
              Seleção Curada
            </span>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2 className="text-[clamp(3rem,10vw,8rem)] font-display italic font-black leading-[0.8] tracking-tighter text-white uppercase">
              OS <br className="hidden lg:block" /> DROPS
            </h2>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] text-white/70 hover:text-white hover:bg-white/10 transition-all uppercase"
                >
                  <SlidersHorizontal size={12} />
                  {sortOptions.find((s) => s.value === sortBy)?.label}
                </button>

                <AnimatePresence>
                  {showSort && (
                    <motion.ul
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 z-30 shadow-2xl"
                    >
                      {sortOptions.map((opt) => (
                        <li key={opt.value}>
                          <button
                            onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                            className={`w-full text-left px-5 py-4 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                              sortBy === opt.value
                                ? 'bg-white text-black'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
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
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-12 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto hidden sm:block text-[10px] font-mono text-white/20 uppercase tracking-widest">
            Exibindo {sorted.length} Peças
          </div>
        </div>

        {/* Grid - 2 columns on mobile for better conversion */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {sorted.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {sorted.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">
              Nenhum produto encontrado nesta categoria.
            </p>
          </div>
        )}

        {/* Footer Link */}
        <div className="mt-24 text-center">
          <button
            className="group inline-flex flex-col items-center gap-4 text-white/30 hover:text-white transition-all"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="text-[10px] font-mono tracking-[0.5em] uppercase">Voltar ao Topo</span>
            <div className="w-px h-12 bg-white/10 group-hover:h-16 transition-all duration-500" />
          </button>
        </div>
      </div>
    </section>
  );
}
