'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Zap } from 'lucide-react';
import { useCart } from '@/store/useCart';
import ClientOnly from '@/components/ClientOnly';
import { ThemeToggle } from '@/components/ThemeToggle';

const navLinks = [
  { label: 'Drops', href: '/produtos' },
  { label: 'Kits', href: '/produtos' },
  { label: 'Collab', href: '#' },
  { label: 'About', href: '#' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleCart, totalItems } = useCart();
  const count = totalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-black/5 dark:border-white/5 py-3' : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 bg-fire-gradient rounded-sm rotate-12 group-hover:rotate-[20deg] transition-transform duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={16} className="text-black font-bold" fill="black" />
              </div>
            </div>
            <span
              className="text-fire-animate font-display text-2xl tracking-wider leading-none"
            >
              BONDS
            </span>
            <span
              className="text-[10px] font-mono tracking-[0.3em] text-black/50 dark:text-white/30 hidden sm:block mt-1 uppercase"
            >
              AGENCE
            </span>
          </motion.a>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.li
                key={link.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
              >
                <a
                  href={link.href}
                  className="text-sm font-body font-semibold tracking-[0.15em] text-black/70 dark:text-white/60 hover:text-black dark:hover:text-white
                             uppercase transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-fire-gradient scale-x-0
                                   group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              </motion.li>
            ))}
          </ul>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Promo Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="hidden sm:flex items-center gap-1 clip-badge bg-fire-gradient px-3 py-1"
            >
              <span
                className="text-[10px] font-mono font-bold text-black tracking-widest uppercase"
              >
                FRETE GRÁTIS
              </span>
            </motion.div>

            <ThemeToggle />

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="relative p-2 rounded-sm border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03]
                         hover:border-fire-orange/40 hover:bg-fire-orange/5 transition-all duration-300 group"
              aria-label="Abrir carrinho"
            >
              <ShoppingBag size={20} className="text-black/70 dark:text-white/70 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <ClientOnly>
		<AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-fire-gradient rounded-full
                               flex items-center justify-center text-[10px] font-bold text-black font-mono"
                  >
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </AnimatePresence>
	      </ClientOnly>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-40 pt-20 pb-8 px-6
                       bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.06] md:hidden"
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 py-3 border-b border-black/[0.05] dark:border-white/[0.05] group"
                  >
                    <span className="w-1 h-1 rounded-full bg-fire-orange group-hover:w-6 transition-all duration-300" />
                    <span
                      className="text-2xl font-display tracking-wider text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white transition-colors"
                    >
                      {link.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
