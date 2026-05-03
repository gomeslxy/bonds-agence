'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingBag, X } from 'lucide-react';

/* ─── Types ────────────────────────────────────────────── */
export type ToastType = 'success' | 'cart' | 'error';

export interface Toast {
  id: string;
  message: string;
  sub?: string;
  type: ToastType;
}

/* ─── Global emitter (no context needed) ──────────────── */
type Listener = (t: Toast) => void;
const listeners: Listener[] = [];

export function fireToast(message: string, sub?: string, type: ToastType = 'success') {
  const toast: Toast = { id: crypto.randomUUID(), message, sub, type };
  listeners.forEach((fn) => fn(toast));
}

/* ─── Ember particle ──────────────────────────────────── */
function Ember({ delay }: { delay: number }) {
  const angle = Math.random() * Math.PI * 2;
  const dist  = 60 + Math.random() * 80;
  const size  = 2 + Math.random() * 4;
  const color = ['#00BFFF', '#00FFFF', '#007FFF', '#1E90FF'][Math.floor(Math.random() * 4)];

  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, top: '50%', left: '50%', boxShadow: `0 0 ${size * 2}px ${color}` }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 20,
        scale: 0,
      }}
      transition={{ duration: 0.8 + Math.random() * 0.4, delay, ease: 'easeOut' }}
    />
  );
}

/* ─── Single Toast Card ───────────────────────────────── */
function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    setBurst(true);
    const t = setTimeout(() => onDismiss(toast.id), 3800);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const Icon = toast.type === 'cart' ? ShoppingBag : CheckCircle;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 60, scale: 0.85, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0.01px)' }}
      exit={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(4px)' }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className="relative flex items-center gap-3 min-w-[280px] max-w-xs px-4 py-3 overflow-hidden"
      style={{
        background: 'rgba(8,8,8,0.96)',
        border: '1px solid rgba(0,191,255,0.25)',
        borderRadius: '3px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 30px rgba(0,191,255,0.2), 0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* Animated fire border top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 3.8, ease: 'linear' }}
        style={{
          background: 'linear-gradient(90deg, #007FFF, #00BFFF, #00FFFF)',
          transformOrigin: 'left',
        }}
      />

      {/* Icon with ember burst */}
      <div className="relative flex-shrink-0">
        <div
          className="w-9 h-9 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,191,255,0.2), rgba(0,191,255,0.05))',
            border: '1px solid rgba(0,191,255,0.3)',
            borderRadius: '2px',
          }}
        >
          <Icon size={16} style={{ color: '#00BFFF' }} />
        </div>
        {burst && [...Array(10)].map((_, i) => <Ember key={i} delay={i * 0.04} />)}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm text-white font-semibold leading-tight truncate"
          style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif", fontWeight: 700, letterSpacing: '0.05em' }}
        >
          {toast.message}
        </p>
        {toast.sub && (
          <p
            className="text-[10px] mt-0.5 truncate"
            style={{ fontFamily: "'Space Mono', monospace", color: '#00BFFF88' }}
          >
            {toast.sub}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

/* ─── Provider / Mount this once in layout ────────────── */
export default function ToastVFXProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler: Listener = (t) => setToasts((prev) => [...prev.slice(-3), t]);
    listeners.push(handler);
    return () => { const i = listeners.indexOf(handler); if (i > -1) listeners.splice(i, 1); };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
