'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Zap, User, LogOut, Package } from 'lucide-react';
import { useCart } from '@/store/useCart';
import ClientOnly from '@/components/ClientOnly';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: 'Coleções', href: '/produtos' },
  { label: 'Drops', href: '/produtos' },
  { label: 'Sobre', href: '/sobre' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toggleCart, totalItems } = useCart();
  const count = totalItems();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
    window.location.reload();
  };

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
            className="flex items-center gap-3 group"
          >
            <div className="flex flex-col items-start leading-none">
              <span
                className="font-display text-3xl tracking-tighter text-black dark:text-white"
              >
                BONDS
              </span>
              <span
                className="text-[9px] font-mono tracking-[0.4em] text-black/40 dark:text-white/30 uppercase -mt-0.5"
              >
                AGENCE
              </span>
            </div>
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
                  className="text-xs font-body font-bold tracking-[0.2em] text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white
                             uppercase transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-black dark:bg-white scale-x-0
                                   group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </a>
              </motion.li>
            ))}
          </ul>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Promo Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="hidden lg:flex items-center gap-2 border border-black/10 dark:border-white/10 px-3 py-1 bg-black/5 dark:bg-white/5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span
                className="text-[9px] font-mono font-bold text-black/60 dark:text-white/40 tracking-[0.2em] uppercase"
              >
                ENVIO 24H
              </span>
            </motion.div>

            <ThemeToggle />

            {/* Auth Section */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-3">
                  <motion.a
                    href="/profile"
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] text-[10px] font-mono font-bold tracking-widest text-black/60 dark:text-white/40 hover:text-black dark:hover:text-white transition-all"
                  >
                    PERFIL
                  </motion.a>
                  <motion.a
                    href="/orders"
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] text-[10px] font-mono font-bold tracking-widest text-black/60 dark:text-white/40 hover:text-black dark:hover:text-white transition-all"
                  >
                    MEUS PEDIDOS
                  </motion.a>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors"
                    title="Sair"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <motion.a
                  href="/login"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-all"
                >
                  <User size={12} />
                  LOGIN
                </motion.a>
              )}
            </div>

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="relative p-2 rounded-sm border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03]
                         hover:border-black/30 dark:hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 group"
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
                    className="absolute -top-1 -right-1 w-4 h-4 bg-black dark:bg-white rounded-full
                               flex items-center justify-center text-[9px] font-bold text-white dark:text-black font-mono"
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
                    <span className="w-1 h-1 rounded-full bg-black dark:bg-white group-hover:w-6 transition-all duration-300" />
                    <span
                      className="text-2xl font-display tracking-wider text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white transition-colors"
                    >
                      {link.label}
                    </span>
                  </a>
                </motion.li>
              ))}

              {/* Mobile Auth Links */}
              <li className="pt-6 mt-4 border-t border-black/10 dark:border-white/10">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <a href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center justify-between group">
                      <span className="text-xl font-display tracking-widest text-black dark:text-white">PERFIL</span>
                      <User size={18} className="text-black/40 dark:text-white/40" />
                    </a>
                    <a href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center justify-between group">
                      <span className="text-xl font-display tracking-widest text-black dark:text-white">MEUS PEDIDOS</span>
                      <Package size={18} className="text-black/40 dark:text-white/40" />
                    </a>
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex items-center justify-between group text-rose-500">
                      <span className="text-xl font-display tracking-widest">SAIR</span>
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <a href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-between group py-2">
                    <span className="text-xl font-display tracking-widest text-black dark:text-white">LOGIN</span>
                    <User size={18} className="text-black/40 dark:text-white/40" />
                  </a>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
