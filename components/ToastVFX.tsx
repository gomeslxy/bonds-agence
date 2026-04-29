'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag, X, AlertTriangle } from 'lucide-react';

/* ─── Types ────────────────────────────────────────────── */
export type ToastType = 'success' | 'cart' | 'error';

export interface Toast {
  id: string;
  message: string;
  sub?: string;
  type: ToastType;
}

/* ─── Global emitter ──────────────────────────────────── */
type Listener = (t: Toast) => void;
const listeners: Listener[] = [];

export function fireToast(message: string, sub?: string, type: ToastType = 'success') {
  const toast: Toast = { id: crypto.randomUUID(), message, sub, type };
  listeners.forEach((fn) => fn(toast));
}

/* ─── Single Toast Card ───────────────────────────────── */
function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const Icon = toast.type === 'cart' ? ShoppingBag : toast.type === 'error' ? AlertTriangle : Check;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="relative flex items-center gap-4 min-w-[300px] max-w-sm px-5 py-4 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto border border-black/5"
    >
      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-black/10"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
      />

      <div className="flex-shrink-0 w-10 h-10 bg-black flex items-center justify-center text-white">
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest leading-tight truncate">
          {toast.message}
        </p>
        {toast.sub && (
          <p className="text-[9px] font-mono uppercase tracking-widest text-black/40 mt-1 truncate">
            {toast.sub}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-black/20 hover:text-black transition-colors p-1"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

/* ─── Provider ─────────────────────────────────────────── */
export default function ToastVFXProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler: Listener = (t) => setToasts((prev) => [...prev.slice(-2), t]);
    listeners.push(handler);
    return () => { 
      const i = listeners.indexOf(handler); 
      if (i > -1) listeners.splice(i, 1); 
    };
  }, []);

  return (
    <div className="fixed top-24 right-6 z-[999] flex flex-col gap-4 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
