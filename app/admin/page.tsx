'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import {
  Shield, LogOut, Plus,
  Package, ShoppingBag, RefreshCw, Zap, Tag, ArrowLeft
} from 'lucide-react';
import { useAdmin } from '@/store/useAdmin';
import { type Product } from '@/data/products';
import ProductForm from './components/ProductForm';
import ProductsTable from './components/ProductsTable';
import OrdersTable from './components/OrdersTable';
import CouponsTable from './components/CouponsTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { logout as authLogout } from '@/app/(auth)/actions';

import { useRouter } from 'next/navigation';

/* ── Main Dashboard ─────────────────────────────────────── */
function Dashboard() {
  const router = useRouter();
  const {
    products, orders, loadProducts, loadOrders, loadCoupons,
    setEditing, editingProduct, refreshData,
    activeTab, setTab, subscribe
  } = useAdmin();

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (editingProduct) setShowForm(true);
  }, [editingProduct]);

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadCoupons();
    
    // Activate Realtime Subscriptions
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, [loadProducts, loadOrders, loadCoupons, subscribe]);

  const openNew  = () => { setEditing(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const pendingOrders = orders.filter((o) => o.status?.toLowerCase() === 'pendente').length;

  const handleLogout = async () => {
    try {
      await authLogout();
      router.push('/login');
    } catch (err) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Fixed top bar -> Changed to Sticky for better mobile flow */}
      <header className="sticky top-0 z-50 flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0 px-4 sm:px-6 py-4 border-b border-black/5 dark:border-white/[0.05] bg-white/90 dark:bg-black/90 backdrop-blur-xl">
        {/* Fire top line */}
        <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
             style={{ background: 'linear-gradient(90deg,#007FFF,#00BFFF,#00FFFF,transparent)' }} />

        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Logo size="sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] leading-none font-display tracking-[0.1em] text-ice-blue uppercase">
                Admin
              </span>
            </div>
          </div>
          
          {/* Mobile Theme & Logout */}
          <div className="flex sm:hidden items-center gap-3">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center w-full sm:w-auto gap-2 sm:gap-4">
          {pendingOrders > 0 && (
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] sm:text-[10px] font-mono text-ice-blue rounded-sm"
                        style={{ background: 'rgba(0,191,255,0.1)', border: '1px solid rgba(0,191,255,0.3)' }}>
              <Zap size={10} fill="#00BFFF" stroke="none" />
              <span>{pendingOrders} pendente{pendingOrders > 1 ? 's' : ''}</span>
            </motion.div>
          )}
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm text-[9px] sm:text-[10px] font-mono uppercase tracking-widest hover:bg-black/10 transition-all group cursor-pointer"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-all" /> 
            <span className="hidden sm:inline">Voltar Loja</span>
            <span className="sm:hidden">Loja</span>
          </button>
          
          {/* Desktop Theme & Logout */}
          <div className="hidden sm:flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1.5 text-[10px] text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors font-mono cursor-pointer p-2"
            >
              <LogOut size={12} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="pt-6 sm:pt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Tab navigation */}
        <div className="flex items-center mb-8">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm w-full sm:w-fit justify-center sm:justify-start">
            {[
              { id: 'products', label: 'Produtos', icon: <Package size={14} /> },
              { id: 'orders',   label: 'Pedidos',  icon: <ShoppingBag size={14} /> },
              { id: 'coupons',  label: 'Cupons',   icon: <Tag size={14} /> },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as 'products' | 'orders' | 'coupons')}
                className={`flex flex-1 sm:flex-none justify-center items-center gap-2 px-3 sm:px-6 py-2 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase transition-all rounded-sm ${
                  activeTab === t.id 
                    ? 'bg-ice-blue text-black' 
                    : 'text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
                <h2 className="text-2xl sm:text-3xl font-display tracking-[0.08em] text-black/80 dark:text-white/80 text-center sm:text-left">
                  GESTÃO DE <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] to-[#00FFFF]">PRODUTOS</span>
                </h2>
                <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3">
                  <motion.button onClick={refreshData} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                 className="flex items-center gap-2 px-4 py-2 text-xs text-black/40 dark:text-white/40 border border-black/10 dark:border-white/10 hover:text-black dark:hover:text-white transition-colors">
                    <RefreshCw size={11} />
                    Recarregar
                  </motion.button>
                  <motion.button onClick={openNew} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                 className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black font-body tracking-[0.1em] rounded-sm"
                                 style={{ background: 'linear-gradient(135deg,#007FFF,#00BFFF,#00FFFF)' }}>
                    <Plus size={14} />
                    Novo Produto
                  </motion.button>
                </div>
              </div>
              <ProductsTable />
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h2 className="text-3xl mb-6 font-display tracking-[0.08em] text-black/80 dark:text-white/80">
                GESTÃO DE <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] to-[#00FFFF]">PEDIDOS</span>
              </h2>
              <OrdersTable />
            </motion.div>
          )}

          {activeTab === 'coupons' && (
            <motion.div key="coupons" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h2 className="text-3xl mb-6 font-display tracking-[0.08em] text-black/80 dark:text-white/80">
                GESTÃO DE <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] to-[#00FFFF]">CUPONS</span>
              </h2>
              <CouponsTable />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product form modal */}
      <AnimatePresence>
        {showForm && <ProductForm onClose={closeForm} />}
      </AnimatePresence>
    </div>
  );
}

/* ── Page export ────────────────────────────────────────── */
export default function AdminPage() {
  return <Dashboard />;
}
