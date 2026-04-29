'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { formatCurrency, validateCPF } from '@/lib/utils';
import { fireToast } from '@/components/ToastVFX';
import Link from 'next/link';
import { Search, Package, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

const formatCPF = (v: string) => {
  v = v.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export default function OrdersPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'cpf' | 'name'>('email');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const findOrders = async () => {
    if (!query || query.length < 3) return;

    if (searchType === 'cpf' && !validateCPF(query)) {
      fireToast('CPF Inválido', 'O CPF informado não é válido.');
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      let q = supabase.from('orders').select('*');
      const trimmed = query.trim();
      
      if (searchType === 'email') {
        q = q.eq('customer_email', trimmed);
      } else if (searchType === 'cpf') {
        const clean = trimmed.replace(/\D/g, '');
        const masked = formatCPF(clean);
        // Search for either masked or unmasked version
        q = q.or(`customer_cpf.eq.${clean},customer_cpf.eq.${masked}`);
      } else {
        q = q.ilike('customer_name', `%${trimmed}%`);
      }

      const { data, error } = await q.order('created_at', { ascending: false });

      if (data) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-black/50 dark:text-white/40 mb-8 font-light max-w-md font-body">Consulte o status e histórico de suas compras.</p>

          <div className="flex gap-2 mb-6">
            {[
              { id: 'email', label: 'E-mail' },
              { id: 'cpf', label: 'CPF' },
              { id: 'name', label: 'Nome' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setSearchType(t.id as any); setQuery(''); }}
                className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all rounded-sm border ${
                  searchType === t.id 
                    ? 'bg-fire-orange text-black border-fire-orange' 
                    : 'bg-transparent text-black/40 dark:text-white/30 border-black/10 dark:border-white/10 hover:border-fire-orange/40'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4 mb-16">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={
                  searchType === 'email' ? 'seu@email.com' :
                  searchType === 'cpf' ? '000.000.000-00' : 'Seu nome completo'
                }
                value={query}
                onChange={(e) => {
                  let val = e.target.value;
                  if (searchType === 'cpf') val = formatCPF(val);
                  setQuery(val);
                }}
                onKeyDown={(e) => e.key === 'Enter' && findOrders()}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-4 rounded-sm outline-none focus:border-fire-orange/50 transition-all font-mono text-sm text-black dark:text-white"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={findOrders}
              disabled={loading}
              className="px-8 btn-fire text-white font-bold uppercase tracking-widest text-sm rounded-sm disabled:opacity-50 font-body"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
            </motion.button>
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
            ) : searched ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-sm">
                <p className="text-black/40 dark:text-white/20 font-mono text-sm tracking-widest uppercase">
                  Nenhum pedido encontrado para este {searchType === 'email' ? 'e-mail' : searchType === 'cpf' ? 'CPF' : 'nome'}.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
