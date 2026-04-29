'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Shield, LogOut, Plus, Pencil, Trash2,
  Package, ShoppingBag, RefreshCw, Zap, Lock,
} from 'lucide-react';
import { useAdmin } from '@/store/useAdmin';
import { type Product } from '@/data/products';
import ProductForm from './components/ProductForm';
import OrdersTable from './components/OrdersTable';
import { ThemeToggle } from '@/components/ThemeToggle';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ── Auth Gate ──────────────────────────────────────────── */
function AuthGate() {
  const { login } = useAdmin();
  const [pw, setPw]         = useState('');
  const [error, setError]   = useState<'wrong' | 'blocked' | null>(null);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer when rate-limited
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleLogin = async () => {
    if (loading || cooldown > 0) return;
    setLoading(true);
    setError(null);
    const result = await login(pw);
    setLoading(false);
    if (result === true) return;
    if (result === 'blocked') {
      setError('blocked');
      setCooldown(60);
    } else {
      setError('wrong');
      setTimeout(() => setError(null), 1800);
    }
  };

  const isBlocked = error === 'blocked' || cooldown > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, rgba(255,34,0,0.06) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        <div>
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#FF0000,#FFA500)', borderRadius: '4px' }}>
            <Shield size={28} className="text-black" />
          </div>
          <h1 className="text-5xl mb-2 font-display tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-br from-[#FF0000] via-[#FF4500] to-[#FFA500]">
            ADMIN
          </h1>
          <p className="text-[10px] text-black/40 dark:text-white/20 tracking-widest font-mono">BONDS AGENCE · PAINEL DE CONTROLE</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="password" value={pw} placeholder="Senha de acesso"
              disabled={isBlocked || loading}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 text-black dark:text-white placeholder-black/30 dark:placeholder-white/20 outline-none text-center disabled:opacity-40 font-mono tracking-[0.2em]"
              style={{
                background: error === 'wrong' ? 'rgba(255,0,0,0.06)' : isBlocked ? 'rgba(255,165,0,0.04)' : focused ? 'rgba(255,69,0,0.04)' : 'rgba(128,128,128,0.05)',
                border: `1px solid ${error === 'wrong' ? '#FF0000' : isBlocked ? 'rgba(255,165,0,0.4)' : focused ? '#FF4500' : 'rgba(128,128,128,0.2)'}`,
                borderRadius: '2px',
                boxShadow: error === 'wrong' ? '0 0 20px rgba(255,0,0,0.2)' : isBlocked ? '0 0 20px rgba(255,165,0,0.15)' : focused ? '0 0 12px rgba(255,69,0,0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}
            />
            {focused && !isBlocked && (
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                          className="absolute bottom-0 left-0 right-0 h-px origin-left"
                          style={{ background: 'linear-gradient(90deg,#FF0000,#FF4500,#FFA500)' }} />
            )}
          </div>

          {/* Rate limit warning banner */}
          <AnimatePresence>
            {isBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-mono text-fire-amber"
                style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.25)', borderRadius: '2px' }}
              >
                <Lock size={10} />
                Bloqueado por tentativas excessivas{cooldown > 0 ? ` · ${cooldown}s` : ''}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleLogin}
            disabled={isBlocked || loading}
            whileHover={!isBlocked && !loading ? { scale: 1.02 } : {}}
            whileTap={!isBlocked && !loading ? { scale: 0.98 } : {}}
            animate={error === 'wrong' ? { x: [-6, 6, -6, 6, 0] } : {}}
            transition={error === 'wrong' ? { duration: 0.3 } : {}}
            className="w-full py-3.5 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed font-body font-bold rounded-sm text-black"
            style={{
              background: isBlocked ? 'rgba(255,165,0,0.3)' : 'linear-gradient(135deg,#FF0000,#FF4500,#FFA500)',
              color: isBlocked ? '#FFA500' : 'black',
            }}
          >
            <Lock size={14} />
            {loading ? 'Verificando...' : isBlocked ? `Aguarde ${cooldown}s` : error === 'wrong' ? 'Senha Incorreta' : 'Entrar'}
          </motion.button>
        </div>

        <p className="text-[10px] text-black/30 dark:text-white/15 font-mono">
          Acesso restrito · BONDS AGENCE
        </p>
      </motion.div>
    </div>
  );
}

/* ── Product row ────────────────────────────────────────── */
function ProductRow({ product, onEdit, onDelete }: {
  product: Product; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <motion.tr layout className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors group">
      <td className="px-4 py-3">
        <div className="relative w-10 h-12 overflow-hidden flex-shrink-0" style={{ borderRadius: '2px' }}>
          <Image src={product.image} alt={product.name} fill className="object-cover object-top" />
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-black dark:text-white font-display tracking-[0.05em] text-[1rem]">
          {product.name}
        </p>
        <p className="text-[10px] text-black/50 dark:text-white/30 font-mono">{product.category}</p>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-lg font-display text-transparent bg-clip-text bg-gradient-to-br from-[#FF4500] to-[#FFA500]">
          {fmt(product.price)}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-black/60 dark:text-white/50 font-mono">
          {product.stock} un
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex gap-1 flex-wrap">
          {product.sizes.map((s) => (
            <span key={s} className="text-[9px] border border-black/10 dark:border-white/10 px-1.5 py-0.5 text-black/50 dark:text-white/30 font-mono rounded-[1px]">
              {s}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        {product.tag && (
          <span className="text-[10px] px-2 py-1 font-bold font-mono rounded-[1px]"
                style={{ background: product.tagColor ?? '#FF0000', color: 'black' }}>
            {product.tag}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onEdit}
                         className="p-1.5 border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/25 transition-all rounded-sm">
            <Pencil size={12} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onDelete}
                         className="p-1.5 border border-red-900/30 text-red-500/40 hover:text-red-400 hover:border-red-500/40 transition-all"
                         style={{ borderRadius: '2px' }}>
            <Trash2 size={12} />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
}

/* ── Main Dashboard ─────────────────────────────────────── */
function Dashboard() {
  const {
    products, orders, loadProducts, loadOrders,
    removeProduct, setEditing, resetToDefault, refreshData,
    activeTab, setTab, editingProduct, logout, isLoading, subscribe
  } = useAdmin();

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProducts();
    loadOrders();
    
    // Activate Realtime Subscriptions
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, [loadProducts, loadOrders, subscribe]);

  const openNew  = () => { setEditing(null); setShowForm(true); };
  const openEdit = (p: Product) => { setEditing(p); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const pendingOrders = orders.filter((o) => o.status?.toLowerCase() === 'pendente').length;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Fixed top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/[0.05] bg-white/90 dark:bg-black/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FF0000,#FFA500)', borderRadius: '2px' }}>
            <Shield size={14} className="text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg leading-none font-display tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-br from-[#FF0000] to-[#FFA500]">
              BONDS ADMIN
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
              </span>
              <span className="text-[7px] text-orange-500/70 tracking-[0.2em] font-bold uppercase font-mono">
                Live Sync Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {pendingOrders > 0 && (
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-fire-amber rounded-sm"
                        style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)' }}>
              <Zap size={10} fill="#FFA500" stroke="none" />
              {pendingOrders} pendente{pendingOrders > 1 ? 's' : ''}
            </motion.div>
          )}
          <a href="/" target="_blank" className="text-[10px] text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors font-mono">
            Ver Loja ↗
          </a>
          <ThemeToggle />
          <button onClick={logout} className="flex items-center gap-1.5 text-[10px] text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors font-mono">
            <LogOut size={12} />
            Sair
          </button>
        </div>
      </header>

      {/* Fire top line */}
      <div className="fixed top-[57px] left-0 right-0 z-40 h-px"
           style={{ background: 'linear-gradient(90deg,#FF0000,#FF4500,#FFA500,transparent)' }} />

      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Tab navigation */}
        <div className="flex items-center gap-2 mb-8 mt-6">
          {[
            { key: 'products', label: 'Produtos', icon: <ShoppingBag size={13} />, count: products.length },
            { key: 'orders',   label: 'Pedidos',  icon: <Package size={13} />,     count: orders.length },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setTab(tab.key as 'products' | 'orders')}
                      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.15em] transition-all duration-200 font-body rounded-sm ${
                        active ? 'text-black bg-gradient-to-br from-[#FF0000] via-[#FF4500] to-[#FFA500] border-transparent drop-shadow-[0_0_20px_rgba(255,69,0,0.3)]' : 'text-black/50 dark:text-white/40 border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]'
                      }`}
                      >
                {tab.icon}
                {tab.label}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-black/5 dark:bg-white/5">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display tracking-[0.08em] text-black/80 dark:text-white/80">
                  GESTÃO DE <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#FF0000] to-[#FFA500]">PRODUTOS</span>
                </h2>
                <div className="flex gap-3">
                  <motion.button onClick={resetToDefault} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                 className="flex items-center gap-2 px-4 py-2 text-xs text-black/40 dark:text-white/40 border border-black/10 dark:border-white/10 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 transition-all font-mono rounded-sm">
                    <RefreshCw size={11} />
                    Resetar
                  </motion.button>
                  <motion.button onClick={openNew} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                 className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black font-body tracking-[0.1em] rounded-sm"
                                 style={{ background: 'linear-gradient(135deg,#FF0000,#FF4500,#FFA500)' }}>
                    <Plus size={14} />
                    Novo Produto
                  </motion.button>
                </div>
              </div>

              <div className="overflow-x-auto border border-black/10 dark:border-white/5 rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/5 dark:border-white/[0.06] bg-black/5 dark:bg-white/[0.02]">
                      {['Foto', 'Produto', 'Preço', 'Estoque', 'Tamanhos', 'Tag', 'Ações'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase text-black/40 dark:text-white/30 font-mono">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {products.map((p) => (
                        <ProductRow key={p.id} product={p}
                                    onEdit={() => openEdit(p)}
                                    onDelete={() => removeProduct(p.id)} />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-3xl mb-6 font-display tracking-[0.08em] text-black/80 dark:text-white/80">
                GESTÃO DE <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#FF0000] to-[#FFA500]">PEDIDOS</span>
              </h2>
              <OrdersTable />
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
  const { isAuthenticated } = useAdmin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-white dark:bg-black" />;

  return isAuthenticated ? <Dashboard /> : <AuthGate />;
}
