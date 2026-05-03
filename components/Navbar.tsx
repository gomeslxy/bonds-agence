'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Zap, User, LogOut } from 'lucide-react';
import { useCart } from '@/store/useCart';
import ClientOnly from '@/components/ClientOnly';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { logout } from '@/app/(auth)/actions';

const navLinks = [
  { label: 'Início', href: '/' },
  { label: 'Produtos', href: '/produtos' },
  { label: 'Meus Pedidos', href: '/orders' },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [user,      setUser]      = useState<any>(null);
  const { toggleCart, totalItems } = useCart();
  const count = totalItems();

  useEffect(() => {
    // Stable client instance — only created once
    const supabase = createClient();

    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Check auth session on mount
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      // Sync Cart on Login: pull cloud cart if local is empty
      if (newUser) {
        const cloudCart = newUser.user_metadata?.cart || [];
        const localCart = useCart.getState().items;
        if (localCart.length === 0 && cloudCart.length > 0) {
          useCart.setState({ items: cloudCart });
        }
      }
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'nav-blur py-3' : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-16 flex items-center justify-between">
          
          {/* Logo - Fixed side */}
          <div className="flex items-center">
            <Link href="/" className="group">
              <Logo size="md" />
            </Link>
          </div>

          {/* Desktop Nav Links - MATHEMATICAL CENTER */}
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <ul className="flex items-center gap-10">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    className="text-[12px] font-body font-black tracking-[0.25em] uppercase transition-all duration-300 relative group"
                    style={{
                      background: 'linear-gradient(135deg, #00BFFF 0%, #007FFF 50%, #00FFFF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 8px rgba(0,191,255,0.2))',
                    }}
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-ice-gradient scale-x-0
                                     group-hover:scale-x-100 transition-transform duration-300 origin-left shadow-ice-sm" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right Side - Fixed side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Auth Button */}
            <ClientOnly>
              <div className="hidden sm:block">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link href="/profile" className="flex items-center gap-2 text-black/50 dark:text-white/30 hover:text-ice-blue transition-colors uppercase font-mono text-[10px] tracking-widest">
                      <User size={16} /> Perfil
                    </Link>
                    {user?.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'la181009@gmail.com') && (
                      <Link href="/admin" className="text-[10px] font-mono tracking-widest uppercase text-ice-blue hover:opacity-80 transition-opacity">
                        Painel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="text-black/50 dark:text-white/30 hover:text-red-500 transition-colors">
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="flex items-center gap-2 px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm text-[10px] font-mono uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                    <User size={14} /> Entrar
                  </Link>
                )}
              </div>
            </ClientOnly>

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="relative p-2 rounded-sm border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03]
                         hover:border-ice-blue/40 hover:bg-ice-blue/5 transition-all duration-300 group shadow-ice-sm"
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
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ice-gradient rounded-full
                               flex items-center justify-center text-[10px] font-bold text-black font-mono shadow-ice-sm"
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
            className="fixed top-0 left-0 right-0 z-40 pt-24 pb-8 px-6
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
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 py-3 border-b border-black/[0.05] dark:border-white/[0.05] group"
                  >
                    <span className="w-1 h-1 rounded-full bg-ice-blue group-hover:w-6 transition-all duration-300 shadow-ice-sm" />
                    <span
                      className="text-2xl font-display tracking-wider text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white transition-colors"
                    >
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.08 }}
                className="pt-4"
              >
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm font-mono text-xs uppercase tracking-widest text-black/60 dark:text-white/60"
                    >
                      <User size={16} /> Meu Perfil
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-black dark:bg-white text-white dark:text-black rounded-sm font-mono text-xs uppercase tracking-widest"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-ice-gradient text-black rounded-sm font-bold font-mono text-xs uppercase tracking-widest shadow-ice-md"
                  >
                    <User size={16} /> Entrar
                  </Link>
                )}
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
