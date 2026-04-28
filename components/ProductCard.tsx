'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Zap } from 'lucide-react';
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

  const handleAdd = (e: React.MouseEvent) => {
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
  };

  const handleSizeClick = (e: React.MouseEvent, sz: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(sz);
  };

  return (
    <Link href={`/product/${product.id}`} className="block">
      <motion.article
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{
          duration: 0.6,
          delay: index * 0.1,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="product-card-wrap group cursor-pointer"
      >
        {/* Image container */}
        <div className="relative overflow-hidden aspect-[3/4] bg-[#0d0d0d]">
          <div className="card-image absolute inset-0">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
              className="object-cover object-top"
              priority={index < 2}
            />
          </div>

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.85) 100%)',
            }}
          />

          {/* Inner glow */}
          <div className="card-glow" />

          {/* Tag badge */}
          {product.tag && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="absolute top-3 left-3 clip-badge px-3 py-1 z-10"
              style={{ background: product.tagColor ?? '#FF0000' }}
            >
              <span
                className="text-[10px] font-bold text-black tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {product.tag}
              </span>
            </motion.div>
          )}

          {/* Discount badge */}
          {discount && (
            <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/80 border border-white/10
                            flex items-center justify-center z-10">
              <span
                className="text-[9px] font-bold leading-tight text-center"
                style={{ fontFamily: "'Space Mono', monospace", color: '#FFA500' }}
              >
                -{discount}%
              </span>
            </div>
          )}

          {/* Stock warning */}
          {product.stock <= 20 && (
            <div className="absolute bottom-[72px] left-3 right-3 z-10">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#FF0000' }}
                />
                <span
                  className="text-[10px] tracking-wider"
                  style={{ fontFamily: "'Space Mono', monospace", color: '#FF4500' }}
                >
                  Últimas {product.stock} unidades
                </span>
              </div>
            </div>
          )}

          {/* Hover quick-add button */}
          <div className="card-overlay-btn absolute bottom-4 left-3 right-3 z-10">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              className="w-full py-3 flex items-center justify-center gap-2
                         btn-fire font-body font-bold tracking-widest text-sm uppercase"
              style={{
                fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                fontWeight: 700,
                letterSpacing: '0.12em',
                borderRadius: '2px',
              }}
            >
              {added ? (
                <>
                  <Zap size={14} className="relative z-10" fill="black" />
                  <span className="relative z-10">Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={14} className="relative z-10" />
                  <span className="relative z-10">Adicionar · {selectedSize}</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Neon border flash on added */}
          {added && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 pointer-events-none rounded-[inherit]"
              style={{ boxShadow: 'inset 0 0 30px rgba(255,69,0,0.5)' }}
            />
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          {/* Category */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace", color: '#FF450088' }}
            >
              {product.category}
            </span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={8}
                  fill={i < 4 ? '#FFA500' : 'transparent'}
                  stroke={i < 4 ? '#FFA500' : '#ffffff22'}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <h3
              className="text-xl leading-tight text-white group-hover:text-fire-amber transition-colors duration-300"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.05em' }}
            >
              {product.name}
            </h3>
            <p
              className="text-[11px] text-white/30 mt-0.5"
              style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}
            >
              {product.subtitle}
            </p>
          </div>

          {/* Size selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                onClick={(e) => handleSizeClick(e, sz)}
                className={`px-2.5 py-1 text-[10px] font-mono border transition-all duration-200 ${
                  selectedSize === sz
                    ? 'border-fire-orange text-fire-orange bg-fire-orange/10'
                    : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/60'
                }`}
                style={{ fontFamily: "'Space Mono', monospace", borderRadius: '1px' }}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Price Row */}
          <div className="flex items-end justify-between pt-1">
            <div>
              <div
                className="text-xl font-display leading-none"
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  background: 'linear-gradient(135deg, #FF0000, #FF4500, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {fmt(product.price)}
              </div>
              {product.originalPrice && (
                <div
                  className="text-[11px] text-white/25 line-through mt-0.5"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {fmt(product.originalPrice)}
                </div>
              )}
            </div>

            {/* Color dots */}
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 3).map((c) => (
                <div
                  key={c.hex}
                  title={c.name}
                  className="w-3 h-3 rounded-full border border-white/10"
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
