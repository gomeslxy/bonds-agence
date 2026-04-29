'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Home, ShoppingBag, Check, Zap, Package, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') ?? `ORD-${Math.floor(Math.random() * 9000) + 1000}`;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (orderId) {
      sessionStorage.setItem(`order_verified_${orderId}`, 'true');
    }
  }, [orderId]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl text-center space-y-12"
      >
        {/* Success Icon */}
        <div className="relative inline-flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-white flex items-center justify-center rounded-full text-black"
          >
            <Check size={40} strokeWidth={3} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 border-2 border-white rounded-full"
          />
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10"
          >
            <Zap size={10} className="text-white/40" />
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/60">
              {orderId}
            </span>
          </motion.div>
          
          <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-bold tracking-tight leading-none uppercase italic">
            Order <br /> Confirmed
          </h1>
          
          <p className="text-white/40 text-sm tracking-wide max-w-sm mx-auto leading-relaxed">
            Seu pedido foi registrado com sucesso. <br />
            <span className="text-white font-bold">Aguardando confirmação do PIX.</span> <br />
            <span className="text-[11px] font-mono uppercase tracking-widest mt-2 block opacity-40">A validação manual pode levar até 24h úteis.</span>
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Aguardando PIX', sub: 'Instant' },
            { label: 'Validação Manual', sub: 'Up to 24h' },
            { label: 'Kit Enviado', sub: 'Shipping' },
          ].map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="p-6 bg-white/5 border border-white/5 text-center"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{step.label}</p>
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{step.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/" className="btn-premium px-12 py-5 flex items-center justify-center gap-3">
            <Home size={16} /> Home
          </Link>
          <Link href="/produtos" className="btn-premium-outline px-12 py-5 flex items-center justify-center gap-3">
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="pt-12"
        >
          <p className="text-[9px] font-mono tracking-[0.4em] text-white/20 uppercase">
            Thank you for choosing Bonds Agence
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]">Loading Order...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
