'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight, Zap, ExternalLink } from 'lucide-react';
import { useCart } from '@/store/useCart';

const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CartSidebar() {
  const { isOpen, closeCart, items, removeItem, updateQty, totalPrice, totalItems } =
    useCart();

  const total = totalPrice();
  const count = totalItems();

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeCart]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="cart-sidebar fixed top-0 right-0 bottom-0 z-[90] w-full max-w-md flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FF0000, #FFA500)', borderRadius: '2px' }}
                >
                  <ShoppingBag size={14} className="text-black" />
                </div>
                <div>
                  <h2
                    className="text-lg leading-none"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}
                  >
                    CARRINHO
                  </h2>
                  <p
                    className="text-[10px] text-white/30 mt-0.5"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {count} {count === 1 ? 'item' : 'itens'}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center border border-white/10
                           text-white/40 hover:text-white hover:border-white/30 transition-all"
                style={{ borderRadius: '2px' }}
              >
                <X size={14} />
              </motion.button>
            </div>

            {/* Fire border line */}
            <div
              className="h-px w-full flex-shrink-0"
              style={{ background: 'linear-gradient(90deg, #FF0000, #FF4500, #FFA500, transparent)' }}
            />

            {/* Items list */}
            <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-6 py-20 text-center"
                  >
                    <div
                      className="w-16 h-16 flex items-center justify-center border border-white/10"
                      style={{ borderRadius: '2px' }}
                    >
                      <ShoppingBag size={24} className="text-white/20" />
                    </div>
                    <div>
                      <p
                        className="text-2xl text-white/30"
                        style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}
                      >
                        Carrinho Vazio
                      </p>
                      <p
                        className="text-[11px] text-white/20 mt-2"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        Adicione produtos para continuar
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={closeCart}
                      className="btn-fire px-6 py-3 text-sm uppercase font-bold tracking-wider"
                      style={{
                        fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        borderRadius: '2px',
                      }}
                    >
                      <span>Ver Produtos</span>
                    </motion.button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, x: 30, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                      className="flex gap-4 p-3 border border-white/[0.05] hover:border-fire-orange/20 transition-colors duration-300 group"
                      style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '2px' }}
                    >
                      {/* Item Image */}
                      <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden" style={{ borderRadius: '2px' }}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover object-top"
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: 'linear-gradient(135deg, rgba(255,69,0,0.15), transparent)' }}
                        />
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-sm text-white leading-tight truncate"
                          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.05em', fontSize: '1rem' }}
                        >
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-[10px] text-white/30 border border-white/10 px-2 py-0.5"
                            style={{ fontFamily: "'Space Mono', monospace", borderRadius: '1px' }}
                          >
                            {item.size}
                          </span>
                          {item.color && (
                            <span
                              className="text-[10px] text-white/20 truncate"
                              style={{ fontFamily: "'Space Mono', monospace" }}
                            >
                              {item.color}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty controls */}
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateQty(item.id, item.size, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center border border-white/10
                                         text-white/40 hover:text-white hover:border-white/30 transition-all"
                              style={{ borderRadius: '1px' }}
                            >
                              <Minus size={10} />
                            </motion.button>
                            <span
                              className="w-8 text-center text-sm text-white"
                              style={{ fontFamily: "'Space Mono', monospace" }}
                            >
                              {item.quantity}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateQty(item.id, item.size, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center border border-white/10
                                         text-white/40 hover:text-white hover:border-fire-orange hover:text-fire-orange transition-all"
                              style={{ borderRadius: '1px' }}
                            >
                              <Plus size={10} />
                            </motion.button>
                          </div>

                          {/* Price */}
                          <span
                            className="text-base font-bold"
                            style={{
                              fontFamily: "'Bebas Neue', Impact, sans-serif",
                              background: 'linear-gradient(135deg, #FF4500, #FFA500)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            {fmt(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Remove */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.id, item.size)}
                        className="self-start mt-1 p-1 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer – total + CTA */}
            {items.length > 0 && (
              <div className="flex-shrink-0 border-t border-white/[0.06] px-6 py-6 space-y-3">
                {/* Free shipping notice */}
                <div className="flex items-center gap-2">
                  <Zap size={11} fill="#FF4500" stroke="none" />
                  <span
                    className="text-[10px] tracking-wider text-white/40"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    FRETE GRÁTIS em compras acima de R$299
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between py-3 border-y border-white/[0.05]">
                  <span
                    className="text-sm uppercase tracking-wider text-white/40"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    Subtotal
                  </span>
                  <span
                    className="text-2xl"
                    style={{
                      fontFamily: "'Bebas Neue', Impact, sans-serif",
                      letterSpacing: '0.05em',
                      background: 'linear-gradient(135deg, #FF0000, #FF4500, #FFA500)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 10px rgba(255,69,0,0.4))',
                    }}
                  >
                    {fmt(total)}
                  </span>
                </div>

                {/* Ver Carrinho Completo */}
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-2.5 flex items-center justify-center gap-2
                             border border-white/10 text-white/40 hover:text-white
                             hover:border-white/20 transition-all duration-300"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    borderRadius: '2px',
                  }}
                >
                  <ExternalLink size={11} />
                  VER CARRINHO COMPLETO
                </Link>

                {/* Checkout CTA */}
                <Link href="/cart" onClick={closeCart}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-fire w-full py-4 flex items-center justify-center gap-3
                               text-sm uppercase font-bold tracking-widest cursor-pointer"
                    style={{
                      fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      borderRadius: '2px',
                    }}
                  >
                    <span>Finalizar Pedido</span>
                    <ArrowRight size={16} className="relative z-10" />
                  </motion.div>
                </Link>

                <p
                  className="text-center text-[10px] text-white/20"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  🔒 Pagamento 100% Seguro · PIX · Cartão · Boleto
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
