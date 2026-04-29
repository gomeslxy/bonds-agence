'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Tag, Plus, Trash2, Calendar, Users, X } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 text-black font-body font-bold uppercase tracking-widest text-sm rounded-sm hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={16} /> Novo Cupom
        </button>
      </div>

      <div className="overflow-x-auto border border-black/10 dark:border-white/5 rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
              {['Código', 'Desconto', 'Expiração', 'Usos', 'Ações'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase text-black/50 dark:text-white/30 font-mono">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {coupons.map((coupon) => (
                <motion.tr
                  key={coupon.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-black/5 dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.015] transition-colors"
                >
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm font-bold text-fire-orange">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-black/80 dark:text-white/80 font-display">
                      {coupon.discount_percent}% OFF
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/40 font-mono">
                      <Calendar size={12} />
                      {coupon.expiration_date 
                        ? new Date(coupon.expiration_date).toLocaleDateString() 
                        : 'Sem limite'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/40 font-mono">
                      <Users size={12} />
                      {coupon.usage_count}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => removeCoupon(coupon.id)}
                      className="p-2 text-black/20 dark:text-white/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center text-black/30 dark:text-white/20 font-mono text-xs uppercase tracking-widest">
                  Nenhum cupom cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 p-8 rounded-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-display tracking-widest uppercase">Novo Cupom</h3>
                <button onClick={() => setIsFormOpen(false)} className="text-white/20 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase mb-2 text-white/40 font-mono">Código</label>
                  <input
                    required
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    placeholder="EX: BONDS10"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 rounded-sm outline-none focus:border-fire-orange transition-all font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase mb-2 text-white/40 font-mono">Desconto (%)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    value={newCoupon.discount_percent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_percent: parseInt(e.target.value) })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 rounded-sm outline-none focus:border-fire-orange transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase mb-2 text-white/40 font-mono">Expiração (Opcional)</label>
                  <input
                    type="date"
                    value={newCoupon.expiration_date}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiration_date: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 rounded-sm outline-none focus:border-fire-orange transition-all font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-br from-fire-red via-fire-orange to-fire-yellow text-black font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-[1.02] transition-all active:scale-[0.98]"
                >
                  Criar Cupom
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
