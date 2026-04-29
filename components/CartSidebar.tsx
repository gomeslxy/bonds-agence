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
            className="fixed top-0 right-0 bottom-0 z-[90] w-full max-w-md flex flex-col bg-white/98 dark:bg-[#050505]/98 backdrop-blur-2xl border-l border-black/10 dark:border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-sm"
                  style={{ background: 'linear-gradient(135deg, #FF0000, #FFA500)' }}
                >
                  <ShoppingBag size={14} className="text-black" />
                </div>
                <div>
                  <h2
                    className="text-lg font-display leading-none tracking-[0.1em] text-black dark:text-white"
                  >
                    CARRINHO
                  </h2>
                  <p
                    className="text-[10px] text-black/50 dark:text-white/30 mt-0.5 font-mono"
                  >
                    {count} {count === 1 ? 'item' : 'itens'}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center border border-black/10 dark:border-white/10
                           text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-all rounded-sm"
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
                      className="w-16 h-16 flex items-center justify-center border border-black/10 dark:border-white/10 rounded-sm"
                    >
                      <ShoppingBag size={24} className="text-black/20 dark:text-white/20" />
                    </div>
                    <div>
                      <p
                        className="text-2xl text-black/40 dark:text-white/30 font-display tracking-[0.1em]"
                      >
                        Carrinho Vazio
                      </p>
                      <p
                        className="text-[11px] text-black/30 dark:text-white/20 mt-2 font-mono"
                      >
                        Adicione produtos para continuar
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={closeCart}
                      className="btn-fire px-6 py-3 text-sm uppercase font-body font-bold tracking-[0.15em] rounded-sm text-white"
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
                      className="flex gap-4 p-3 border border-black/5 dark:border-white/[0.05] hover:border-fire-orange/40 transition-colors duration-300 group rounded-sm bg-black/[0.02] dark:bg-white/[0.02]"
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
                          className="text-[1rem] text-black dark:text-white leading-tight truncate font-display tracking-[0.05em]"
                        >
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-[10px] text-black/50 dark:text-white/30 border border-black/10 dark:border-white/10 px-2 py-0.5 font-mono rounded-sm"
                          >
                            {item.size}
                          </span>
                          {item.color && (
                            <span
                              className="text-[10px] text-black/40 dark:text-white/20 truncate font-mono"
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
                              className="w-6 h-6 flex items-center justify-center border border-black/10 dark:border-white/10
                                         text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-all rounded-sm"
                            >
                              <Minus size={10} />
                            </motion.button>
                            <span
                              className="w-8 text-center text-sm text-black dark:text-white font-mono"
                            >
                              {item.quantity}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateQty(item.id, item.size, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center border border-black/10 dark:border-white/10
                                         text-black/40 dark:text-white/40 hover:text-fire-orange dark:hover:text-fire-orange hover:border-fire-orange transition-all rounded-sm"
                            >
                              <Plus size={10} />
                            </motion.button>
                          </div>

                          {/* Price */}
                          <span
                            className="text-base font-bold font-display text-fire-glow"
                          >
                            {fmt(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.id, item.size)}
                        className="self-start mt-1 p-1 text-black/30 dark:text-white/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
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
              <div className="flex-shrink-0 border-t border-black/5 dark:border-white/[0.06] px-6 py-6 space-y-3">
                {/* Free shipping notice */}
                <div className="flex items-center gap-2">
                  <Zap size={11} className="text-fire-orange fill-fire-orange" stroke="none" />
                  <span
                    className="text-[10px] tracking-wider text-black/60 dark:text-white/40 font-mono"
                  >
                    FRETE GRÁTIS em compras acima de R$299
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between py-3 border-y border-black/5 dark:border-white/[0.05]">
                  <span
                    className="text-sm uppercase tracking-wider text-black/50 dark:text-white/40 font-mono"
                  >
                    Subtotal
                  </span>
                  <span
                    className="text-2xl font-display text-fire-glow tracking-[0.05em]"
                  >
                    {fmt(total)}
                  </span>
                </div>

                {/* Ver Carrinho Completo */}
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-2.5 flex items-center justify-center gap-2
                             border border-black/10 dark:border-white/10 text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white
                             hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 font-mono text-[0.65rem] tracking-[0.2em] rounded-sm"
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
                               text-sm uppercase font-bold tracking-widest cursor-pointer font-body rounded-sm text-white"
                  >
                    <span>Finalizar Pedido</span>
                    <ArrowRight size={16} className="relative z-10" />
                  </motion.div>
                </Link>

                <p
                  className="text-center text-[10px] text-black/40 dark:text-white/20 font-mono"
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
