'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, LogOut, Plus, Package, ShoppingBag, 
  RefreshCw, Zap, Tag, ArrowLeft, Activity
} from 'lucide-react';
import { useAdmin } from '@/store/useAdmin';
import { type Product } from '@/data/products';
import ProductForm from './components/ProductForm';
import ProductsTable from './components/ProductsTable';
import OrdersTable from './components/OrdersTable';
import CouponsTable from './components/CouponsTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/client';

/* ── Main Dashboard ─────────────────────────────────────── */
function Dashboard() {
  const {
    products, orders, loadProducts, loadOrders,
    setEditing, activeTab, setTab, refreshData, subscribe
  } = useAdmin();

  const [showForm, setShowForm] = useState(false);
  const clientSupabase = createClient();

  useEffect(() => {
    loadProducts();
    loadOrders();
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, [loadProducts, loadOrders, subscribe]);

  const openNew  = () => { setEditing(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const pendingOrders = orders.filter((o) => o.status?.toLowerCase() === 'pendente').length;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500 grid-pattern relative">
      
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="scanline" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/5 dark:bg-white/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/5 dark:bg-white/[0.03] blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black dark:bg-white flex items-center justify-center rounded-sm transition-transform hover:rotate-12 duration-300">
              <Shield size={20} className="text-white dark:text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-[0.2em] uppercase italic">
                Bonds <span className="text-black/40 dark:text-white/40">Admin</span>
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/20 dark:bg-white/20 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black dark:bg-white"></span>
                </span>
                <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-black/40 dark:text-white/40">
                  Rede em Tempo Real Ativa
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <AnimatePresence>
              {pendingOrders > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-sm"
                >
                  <Activity size={12} className="animate-pulse" />
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                    {pendingOrders} Pedido{pendingOrders > 1 ? 's' : ''} Pendente{pendingOrders > 1 ? 's' : ''}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-8 w-px bg-black/5 dark:bg-white/10 mx-2" />

            <div className="flex items-center gap-4">
              <Link href="/" className="text-[10px] font-mono tracking-[0.2em] uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Loja
              </Link>
              <ThemeToggle />
              <button 
                onClick={async () => {
                  await clientSupabase.auth.signOut();
                  window.location.href = '/login';
                }} 
                className="w-10 h-10 flex items-center justify-center rounded-sm bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-40 max-w-7xl mx-auto px-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex p-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
            {([
              { id: 'products', label: 'Produtos', icon: <Package size={14} /> },
              { id: 'orders',   label: 'Pedidos', icon: <ShoppingBag size={14} /> },
              { id: 'coupons',  label: 'Cupons', icon: <Tag size={14} /> },
            ] as const).map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-3 px-8 py-3 text-[10px] font-mono tracking-[0.3em] uppercase transition-all duration-500 rounded-sm ${
                    isActive ? 'text-white dark:text-black' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="tab-active"
                      className="absolute inset-0 bg-black dark:bg-white z-0 rounded-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    {t.icon} {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={refreshData}
              className="w-12 h-12 flex items-center justify-center border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all rounded-sm group"
              title="Atualizar Dados"
            >
              <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
            </button>
            <button 
              onClick={openNew}
              className="btn-premium px-8 flex items-center gap-3"
            >
              <Plus size={16} /> Novo Cadastro
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="relative min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-12">
                <h2 className="text-5xl font-bold tracking-tight uppercase italic flex items-center gap-6">
                  {activeTab === 'products' ? 'Produtos' : activeTab === 'orders' ? 'Pedidos' : 'Cupons'}
                  <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                </h2>
              </div>

              {activeTab === 'products' && <ProductsTable />}
              {activeTab === 'orders'   && <OrdersTable />}
              {activeTab === 'coupons'  && <CouponsTable />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)]"
            >
              <ProductForm onClose={closeForm} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative HUD Elements */}
      <div className="fixed bottom-8 left-8 pointer-events-none z-50">
        <div className="flex flex-col gap-1">
          <div className="text-[8px] font-mono tracking-[0.4em] uppercase text-black/20 dark:text-white/20">Status do Sistema</div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full" />
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-black/40 dark:text-white/40 italic">Operacional</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page export ────────────────────────────────────────── */
export default function AdminPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-white dark:bg-black" />;

  return <Dashboard />;
}
