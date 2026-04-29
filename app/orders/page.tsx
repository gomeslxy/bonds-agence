'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { formatCurrency, validateCPF } from '@/lib/utils';
import { fireToast } from '@/components/ToastVFX';
import Link from 'next/link';
import { Search, Package, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const formatCPF = (v: string) => {
  v = v.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const supabaseClient = createClient();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        router.push('/login?redirectTo=/orders');
        return;
      }
      setUser(user);
      
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };
    init();
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-fire-orange/30">
      <Navbar />
      
      <div className="fixed inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,69,0,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-8 group font-mono text-[10px] tracking-widest">
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          VOLTAR PARA LOJA
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-6xl mb-4 font-display tracking-tight text-black dark:text-white uppercase">
            MEUS <span className="text-fire-glow">PEDIDOS</span>
          </h1>
          <p className="text-black/50 dark:text-white/40 mb-12 font-light max-w-md font-body">Histórico completo de suas compras na Bonds Agence.</p>
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
                  <Link 
                    href={`/order/${order.id}`}
                    onClick={() => sessionStorage.setItem(`order_verified_${order.id}`, 'true')}
                  >
                    <div className="group bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-6 rounded-sm hover:border-fire-orange/40 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-sm flex items-center justify-center text-fire-orange group-hover:bg-fire-gradient group-hover:text-black transition-all">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] text-black/30 dark:text-white/20 font-mono mb-1 tracking-tighter uppercase">#{order.id.slice(0, 8)}</p>
                          <h3 className="text-xl font-bold font-display tracking-wider text-black dark:text-white">{order.items?.[0]?.name || 'Pedido'} {order.items?.length > 1 && `+${order.items.length - 1}`}</h3>
                          <div className="flex items-center gap-4 mt-1 text-[10px] text-black/40 dark:text-white/40 font-mono uppercase">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(order.created_at).toLocaleDateString()}</span>
                            <span className="px-2 py-0.5 rounded-sm bg-fire-orange/10 border border-fire-orange/20 text-fire-orange font-bold">{order.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div className="hidden sm:block">
                          <p className="text-[10px] text-black/20 dark:text-white/20 font-mono mb-1">TOTAL</p>
                          <p className="text-xl font-display text-fire-glow">{formatCurrency(order.total_price)}</p>
                        </div>
                        <ChevronRight className="text-black/10 dark:text-white/10 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-sm">
                <p className="text-black/40 dark:text-white/20 font-mono text-[10px] tracking-widest uppercase">
                  VOCÊ AINDA NÃO POSSUI PEDIDOS.
                </p>
                <Link href="/produtos" className="inline-block mt-4 text-fire-orange font-mono text-[10px] tracking-widest hover:underline">
                  EXPLORAR PRODUTOS
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
