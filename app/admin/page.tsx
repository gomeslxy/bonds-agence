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
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
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
          <h1 className="text-5xl mb-2"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em',
                       background: 'linear-gradient(135deg,#FF0000,#FF4500,#FFA500)',
                       WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ADMIN
          </h1>
          <p className="text-[10px] text-white/20 tracking-widest"
             style={{ fontFamily: "'Space Mono', monospace" }}>BONDS AGENCE · PAINEL DE CONTROLE</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="password" value={pw} placeholder="Senha de acesso"
              disabled={isBlocked || loading}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 text-white placeholder-white/20 outline-none text-center disabled:opacity-40"
              style={{
                background: error === 'wrong' ? 'rgba(255,0,0,0.06)' : isBlocked ? 'rgba(255,165,0,0.04)' : focused ? 'rgba(255,69,0,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${error === 'wrong' ? '#FF0000' : isBlocked ? 'rgba(255,165,0,0.4)' : focused ? '#FF4500' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '2px',
                fontFamily: "'Space Mono', monospace",
                boxShadow: error === 'wrong' ? '0 0 20px rgba(255,0,0,0.2)' : isBlocked ? '0 0 20px rgba(255,165,0,0.15)' : focused ? '0 0 12px rgba(255,69,0,0.15)' : 'none',
                transition: 'all 0.2s ease',
                letterSpacing: '0.2em',
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
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-[11px]"
                style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.25)', borderRadius: '2px',
                         fontFamily: "'Space Mono', monospace", color: '#FFA500' }}
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
            className="w-full py-3.5 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-black disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isBlocked ? 'rgba(255,165,0,0.3)' : 'linear-gradient(135deg,#FF0000,#FF4500,#FFA500)',
              borderRadius: '2px',
              fontFamily: "'Barlow Condensed', system-ui, sans-serif", fontWeight: 700, letterSpacing: '0.2em',
              color: isBlocked ? '#FFA500' : 'black',
            }}
          >
            <Lock size={14} />
            {loading ? 'Verificando...' : isBlocked ? `Aguarde ${cooldown}s` : error === 'wrong' ? 'Senha Incorreta' : 'Entrar'}
          </motion.button>
        </div>

        <p className="text-[10px] text-white/15" style={{ fontFamily: "'Space Mono', monospace" }}>
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
        <p className="text-sm text-white font-semibold" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.05em', fontSize: '1rem' }}>
          {product.name}
        </p>
        <p className="text-[10px] text-white/30" style={{ fontFamily: "'Space Mono', monospace" }}>{product.category}</p>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-lg" style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          background: 'linear-gradient(135deg,#FF4500,#FFA500)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {fmt(product.price)}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-white/50" style={{ fontFamily: "'Space Mono', monospace" }}>
          {product.stock} un
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex gap-1 flex-wrap">
          {product.sizes.map((s) => (
            <span key={s} className="text-[9px] border border-white/10 px-1.5 py-0.5 text-white/30"
                  style={{ fontFamily: "'Space Mono', monospace", borderRadius: '1px' }}>{s}</span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        {product.tag && (
          <span className="text-[10px] px-2 py-1 font-bold"
                style={{ background: product.tagColor ?? '#FF0000', color: 'black', borderRadius: '1px', fontFamily: "'Space Mono', monospace" }}>
            {product.tag}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onEdit}
                         className="p-1.5 border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all"
                         style={{ borderRadius: '2px' }}>
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

  const pendingOrders = orders.filter((o) => o.status === 'Pendente').length;

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/[0.05]"
              style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(24px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FF0000,#FFA500)', borderRadius: '2px' }}>
            <Shield size={14} className="text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg leading-none" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em',
                                               background: 'linear-gradient(135deg,#FF0000,#FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              BONDS ADMIN
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
              </span>
              <span className="text-[7px] text-orange-500/70 tracking-[0.2em] font-bold uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>
                Live Sync Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {pendingOrders > 0 && (
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px]"
                        style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: '2px',
                                 fontFamily: "'Space Mono', monospace", color: '#FFA500' }}>
              <Zap size={10} fill="#FFA500" stroke="none" />
              {pendingOrders} pendente{pendingOrders > 1 ? 's' : ''}
            </motion.div>
          )}
          <a href="/" target="_blank" className="text-[10px] text-white/30 hover:text-white transition-colors"
             style={{ fontFamily: "'Space Mono', monospace" }}>
            Ver Loja ↗
          </a>
          <motion.button 
            onClick={() => refreshData()} 
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all
                       ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'}`}
            style={{ 
              fontFamily: "'Space Mono', monospace",
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '2px',
              background: 'rgba(255,255,255,0.02)',
              color: '#FFA500',
              boxShadow: isLoading ? '0 0 15px rgba(255,165,0,0.2)' : 'none'
            }}>
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'SINCRONIZANDO...' : 'SINCRONIZAR AGORA'}
          </motion.button>
          <button onClick={logout} className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white transition-colors"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
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
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-widest transition-all duration-200"
                      style={{
                        fontFamily: "'Barlow Condensed', system-ui, sans-serif", fontWeight: 700, letterSpacing: '0.15em',
                        background: active ? 'linear-gradient(135deg,#FF0000,#FF4500,#FFA500)' : 'rgba(255,255,255,0.02)',
                        border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        color: active ? 'black' : 'rgba(255,255,255,0.4)',
                        borderRadius: '2px',
                        boxShadow: active ? '0 0 20px rgba(255,69,0,0.3)' : 'none',
                      }}>
                {tab.icon}
                {tab.label}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: active ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.05)', fontFamily: "'Space Mono', monospace" }}>
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
                <h2 className="text-3xl" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)' }}>
                  GESTÃO DE <span style={{ background: 'linear-gradient(135deg,#FF0000,#FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>PRODUTOS</span>
                </h2>
                <div className="flex gap-3">
                  <motion.button onClick={resetToDefault} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                 className="flex items-center gap-2 px-4 py-2 text-xs text-white/40 border border-white/10 hover:text-white hover:border-white/20 transition-all"
                                 style={{ fontFamily: "'Space Mono', monospace", borderRadius: '2px' }}>
                    <RefreshCw size={11} />
                    Resetar
                  </motion.button>
                  <motion.button onClick={openNew} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                 className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black"
                                 style={{ background: 'linear-gradient(135deg,#FF0000,#FF4500,#FFA500)', borderRadius: '2px',
                                          fontFamily: "'Barlow Condensed', system-ui, sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>
                    <Plus size={14} />
                    Novo Produto
                  </motion.button>
                </div>
              </div>

              <div className="overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      {['Foto', 'Produto', 'Preço', 'Estoque', 'Tamanhos', 'Tag', 'Ações'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase text-white/30"
                            style={{ fontFamily: "'Space Mono', monospace" }}>{h}</th>
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
              <h2 className="text-3xl mb-6" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)' }}>
                GESTÃO DE <span style={{ background: 'linear-gradient(135deg,#FF0000,#FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>PEDIDOS</span>
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

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return isAuthenticated ? <Dashboard /> : <AuthGate />;
}
