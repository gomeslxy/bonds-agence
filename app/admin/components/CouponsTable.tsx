'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Tag, Plus, Trash2, Calendar, Users, X, Percent } from 'lucide-react';
import { useAdmin } from '@/store/useAdmin';

export default function CouponsTable() {
  const { coupons, saveCoupon, removeCoupon } = useAdmin();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_percent: 10,
    expiration_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCoupon({
      ...newCoupon,
      code: newCoupon.code.toUpperCase().trim(),
      expiration_date: newCoupon.expiration_date || null,
    });
    setNewCoupon({ code: '', discount_percent: 10, expiration_date: '' });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-premium px-8 flex items-center gap-3"
        >
          <Plus size={16} /> Novo Cupom
        </button>
      </div>

      <div className="overflow-hidden border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 backdrop-blur-sm rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/[0.02]">
                {['Código', 'Desconto', 'Expiração', 'Usos', 'Ações'].map((h) => (
                  <th key={h} className="px-6 py-5 text-[10px] tracking-[0.4em] uppercase text-black/30 dark:text-white/30 font-mono font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              <AnimatePresence mode="popLayout">
                {coupons.map((coupon) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.015] transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold tracking-[0.2em] uppercase italic text-black dark:text-white">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Percent size={12} className="text-black/20 dark:text-white/20" />
                        <span className="text-sm font-bold font-mono tracking-tight text-black dark:text-white">
                          {coupon.discount_percent}% DESCONTO
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 text-[10px] text-black/40 dark:text-white/40 font-mono uppercase tracking-widest">
                        <Calendar size={12} className="text-black/20 dark:text-white/20" />
                        {coupon.expiration_date 
                          ? new Date(coupon.expiration_date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' }) 
                          : 'PERMANENTE'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 text-[10px] text-black/40 dark:text-white/40 font-mono uppercase tracking-widest">
                        <Users size={12} className="text-black/20 dark:text-white/20" />
                        {coupon.usage_count} USOS
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <motion.button
                        whileHover={{ scale: 1.1, color: 'rgba(239, 68, 68, 1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeCoupon(coupon.id)}
                        className="p-2 text-black/20 dark:text-white/20 transition-all rounded-sm"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <p className="text-[10px] font-mono tracking-[0.5em] text-black/20 dark:text-white/20 uppercase">
                      Nenhum cupom ativo
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-black border border-black/10 dark:border-white/10 p-10 rounded-sm shadow-[0_0_100px_rgba(255,255,255,0.05)]"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-bold tracking-[0.2em] uppercase italic">Novo Cupom</h3>
                <button onClick={() => setIsFormOpen(false)} className="text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[10px] tracking-[0.4em] uppercase text-black/40 dark:text-white/40 font-mono font-bold">Código do Cupom</label>
                  <input
                    required
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    placeholder="E.G. BONDS2025"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-4 rounded-sm outline-none focus:border-black dark:focus:border-white transition-all font-mono uppercase tracking-widest text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] tracking-[0.4em] uppercase text-black/40 dark:text-white/40 font-mono font-bold">Porcentagem de Desconto (%)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    value={newCoupon.discount_percent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_percent: parseInt(e.target.value) })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-4 rounded-sm outline-none focus:border-black dark:focus:border-white transition-all font-mono text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] tracking-[0.4em] uppercase text-black/40 dark:text-white/40 font-mono font-bold">Data de Expiração</label>
                  <input
                    type="date"
                    value={newCoupon.expiration_date}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiration_date: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-4 rounded-sm outline-none focus:border-black dark:focus:border-white transition-all font-mono text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-premium w-full py-5 text-[12px]"
                >
                  Confirmar Ativação
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
