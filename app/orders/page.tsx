'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Search, Package, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const findOrders = async () => {
    if (!email.includes('@')) return;
    setLoading(true);
    setSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email.trim())
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-fire-orange/30">
      <Navbar />
      
      <div className="fixed inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,69,0,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-8 group font-mono text-[10px] tracking-widest">
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          VOLTAR PARA LOJA
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-6xl mb-4" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.05em' }}>
            MEUS <span style={{ background: 'linear-gradient(135deg,#FF0000,#FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PEDIDOS</span>
          </h1>
          <p className="text-white/40 mb-12 font-light max-w-md">Consulte o status e histórico de suas compras usando seu e-mail de cadastro.</p>

          <div className="flex gap-4 mb-16">
            <div className="flex-1 relative">
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && findOrders()}
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-sm outline-none focus:border-fire-orange/50 transition-all font-mono text-sm"
              />
            </div>
            <button
              onClick={findOrders}
              disabled={loading}
              className="px-8 bg-gradient-to-r from-fire-red to-fire-orange text-black font-bold uppercase tracking-widest text-sm rounded-sm hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {loading ? '...' : <Search size={20} />}
            </button>
          </div>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="w-12 h-12 border-2 border-fire-orange/20 border-t-fire-orange rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/20 font-mono text-[10px] tracking-widest">BUSCANDO REGISTROS...</p>
              </motion.div>
            ) : orders.length > 0 ? (
              orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/order/${order.id}`}>
                    <div className="group bg-white/2 border border-white/5 p-6 rounded-sm hover:border-white/20 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center text-fire-orange group-hover:bg-fire-orange group-hover:text-black transition-all">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/20 font-mono mb-1 tracking-tighter">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <h3 className="text-xl font-bold font-bebas tracking-wider">{order.items?.[0]?.name || 'Pedido'} {order.items?.length > 1 && `+${order.items.length - 1}`}</h3>
                          <div className="flex items-center gap-4 mt-1 text-[10px] text-white/40 font-mono uppercase">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(order.created_at).toLocaleDateString()}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-fire-orange">{order.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div className="hidden sm:block">
                          <p className="text-[10px] text-white/20 font-mono mb-1">TOTAL</p>
                          <p className="text-xl font-bebas text-fire-orange">{formatCurrency(order.total_price)}</p>
                        </div>
                        <ChevronRight className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : searched ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-dashed border-white/10">
                <p className="text-white/20 font-mono text-sm tracking-widest uppercase">Nenhum pedido encontrado para este e-mail.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
