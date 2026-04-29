'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Plus } from 'lucide-react';
import { type Product } from '@/data/products';
import { useCart } from '@/store/useCart';
import { fireToast } from '@/components/ToastVFX';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: product.colors[0]?.name ?? '',
      category: product.category,
    });
    fireToast('Adicionado ao carrinho!', `${product.name} · ${selectedSize}`, 'cart');
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [addItem, product, selectedSize]);

  const handleSizeClick = useCallback((e: React.MouseEvent, sz: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(sz);
  }, []);

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{
          duration: 0.6,
          delay: (index % 3) * 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="product-card border border-white/5 hover:border-white/20 transition-all duration-500"
      >
        {/* Image Container */}
        <div className="product-image-container aspect-[4/5]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 33vw"
            className="product-image"
            priority={index < 4}
          />
          
          {/* Overlay for added state */}
          <motion.div 
            animate={{ opacity: added ? 1 : 0 }}
            className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="bg-white text-black p-2 rounded-full">
              <Plus size={24} className="rotate-45" />
            </div>
          </motion.div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {product.tag && (
              <span className="bg-white text-black text-[9px] font-bold tracking-[0.2em] px-2 py-1 uppercase">
                {product.tag}
              </span>
            )}
            {discount && (
              <span className="bg-black/80 text-white text-[9px] font-bold tracking-[0.2em] px-2 py-1 uppercase border border-white/10">
                -{discount}%
              </span>
            )}
          </div>

          {/* Quick Add (Desktop only for better UX) */}
          <div className="hidden lg:block absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
            <button
              onClick={handleAdd}
              className="w-full bg-white text-black py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-colors"
            >
              ADICIONAR · {selectedSize}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 bg-black">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white/90 group-hover:text-white transition-colors line-clamp-1 uppercase">
                {product.name}
              </h3>
              <p className="text-[10px] text-white/40 font-mono tracking-widest mt-0.5 uppercase">
                {product.category}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white tracking-tight">
                {fmt(product.price)}
              </p>
              {product.originalPrice && (
                <p className="text-[10px] text-white/30 line-through">
                  {fmt(product.originalPrice)}
                </p>
              )}
            </div>
          </div>

          {/* Size Pills */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto no-scrollbar">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                onClick={(e) => handleSizeClick(e, sz)}
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-[9px] font-bold transition-all border ${
                  selectedSize === sz
                    ? 'border-white bg-white text-black'
                    : 'border-white/10 text-white/40 hover:border-white/30'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Mobile Add Button (Visible only on mobile for better conversion) */}
          <button
            onClick={handleAdd}
            className="lg:hidden w-full mt-4 bg-white/5 border border-white/10 text-white py-3 text-[9px] font-bold tracking-[0.2em] uppercase active:bg-white active:text-black transition-all"
          >
            {added ? 'ADICIONADO' : 'ADICIONAR'}
          </button>
        </div>
      </motion.article>
    </Link>
  );
}
