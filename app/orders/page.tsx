'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { fireToast } from '@/components/ToastVFX';
import Link from 'next/link';
import { Package, Calendar, ChevronRight, ArrowLeft, Loader2, LogIn } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function OrdersPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadUserOrders(user.email!, user.id);
      } else {
        setLoading(false);
      }
    }
    getSession();
  }, []);

  const loadUserOrders = async (email: string, userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${userId},customer_email.eq.${email}`)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      fireToast('Erro', 'Não foi possível carregar seus pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase() || 'pendente';
    switch (s) {
      case 'pago':
        return 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
      case 'enviado':
        return 'bg-ice-blue/10 border-ice-blue/30 text-ice-blue dark:text-ice-blue shadow-[0_0_15px_rgba(0,191,255,0.15)]';
      case 'entregue':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400';
      case 'cancelado':
        return 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400';
      case 'pendente':
      default:
        return 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 animate-pulse';
    }
  };

  const getCardStyles = (status: string) => {
    const s = status?.toLowerCase() || 'pendente';
    switch (s) {
      case 'pago':
        return 'border-green-500/50 bg-green-500/[0.05] dark:bg-green-500/[0.08] shadow-[0_0_40px_rgba(34,197,94,0.12)] border-l-green-500';
      case 'enviado':
        return 'border-ice-blue/50 bg-ice-blue/[0.05] dark:bg-ice-blue/[0.08] shadow-[0_0_40px_rgba(0,191,255,0.12)] border-l-ice-blue';
      case 'entregue':
        return 'border-purple-500/40 bg-purple-500/[0.03] border-l-purple-500';
      case 'cancelado':
        return 'border-red-500/40 bg-red-500/[0.03] border-l-red-500';
      case 'pendente':
      default:
        return 'border-orange-500/50 bg-orange-500/[0.05] dark:bg-orange-500/[0.08] border-l-orange-500';
    }
  };

  return (
    <main className="min-h-screen text-black dark:text-white selection:bg-ice-blue/30">
      <Navbar />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors mb-8 group font-mono text-[10px] tracking-widest">
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          VOLTAR PARA LOJA
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-6xl mb-4 font-display tracking-tight text-black dark:text-white uppercase">
            MEUS <span className="text-ice-glow">PEDIDOS</span>
          </h1>
          <p className="text-black/50 dark:text-white/40 mb-12 font-light max-w-md font-body">
            Histórico completo de suas compras na Bonds Agence.
          </p>
        </motion.div>

        {!user && !loading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl backdrop-blur-md"
          >
            <div className="w-16 h-16 bg-ice-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-ice-blue" />
            </div>
            <h2 className="text-2xl font-display mb-4">Acesso Restrito</h2>
            <p className="text-black/60 dark:text-white/40 mb-8 max-w-sm mx-auto font-body">
              Você precisa estar autenticado para visualizar seus pedidos e acompanhar entregas.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-ice-gradient text-black rounded-xl font-bold tracking-widest uppercase text-xs shadow-lg shadow-ice-md"
            >
              <LogIn size={16} /> Entrar na minha conta
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <Loader2 className="w-12 h-12 text-ice-blue animate-spin mx-auto mb-4" />
                  <p className="text-black/20 dark:text-white/20 font-mono text-[10px] tracking-widest uppercase">Carregando seus pedidos...</p>
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
                      <div 
                        className={`group bg-black/[0.02] dark:bg-white/[0.02] border p-6 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all flex items-center justify-between backdrop-blur-sm ${getCardStyles(order.status)}`}
                        style={{ borderLeftWidth: '6px', borderLeftStyle: 'solid' }}
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center text-ice-blue group-hover:bg-ice-gradient group-hover:text-black transition-all">
                            <Package size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] text-black/30 dark:text-white/20 font-mono mb-1 tracking-tighter uppercase">#{order.id.slice(0, 8)}</p>
                            <h3 className="text-xl font-bold font-display tracking-wider text-black dark:text-white">
                              {order.items?.[0]?.name || 'Pedido'} {order.items?.length > 1 && `+${order.items.length - 1}`}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-[10px] font-mono uppercase">
                              <span className="flex items-center gap-1 text-black/40 dark:text-white/40"><Calendar size={10} /> {new Date(order.created_at).toLocaleDateString()}</span>
                              <span className={`px-2 py-0.5 rounded-sm border font-bold tracking-widest ${getStatusStyles(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                          <div className="hidden sm:block">
                            <p className="text-[10px] text-black/30 dark:text-white/20 font-mono mb-1 uppercase tracking-widest">TOTAL</p>
                            <p className="text-2xl font-display font-bold"
                               style={{
                                 background: 'linear-gradient(135deg, #004E92, #007FFF, #00BFFF)',
                                 WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                               }}>
                              {formatCurrency(order.total_price)}
                            </p>
                          </div>
                          <ChevronRight className="text-black/20 dark:text-white/10 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]">
                  <p className="text-black/40 dark:text-white/20 font-mono text-sm tracking-widest uppercase">
                    Você ainda não possui pedidos realizados.
                  </p>
                  <Link href="/#produtos" className="inline-block mt-6 text-ice-blue hover:underline font-mono text-[10px] tracking-widest">
                    VER PRODUTOS
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
