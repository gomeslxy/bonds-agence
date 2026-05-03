'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Home, Package, Zap, CheckCircle } from 'lucide-react';

/* ── Ember particle ─────────────────────────────────────── */
function Ember({ i }: { i: number }) {
  const [props, setProps] = useState<any>(null);

  useEffect(() => {
    const angle  = (i / 30) * Math.PI * 2 + (Math.random() - 0.5) * 1.2;
    const dist   = 120 + Math.random() * 200;
    const size   = 3 + Math.random() * 6;
    const colors = ['#00BFFF', '#00FFFF', '#007FFF', '#1E90FF', '#00E5FF', '#00FFFF'];
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const dur    = 1.2 + Math.random() * 1.8;
    const delay  = Math.random() * 0.6;
    setProps({ angle, dist, size, color, dur, delay });
  }, [i]);

  if (!props) return null;

  const { angle, dist, size, color, dur, delay } = props;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        background: color,
        top: '50%', left: '50%',
        marginTop: -size / 2, marginLeft: -size / 2,
        boxShadow: `0 0 ${size * 3}px ${color}`,
      }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 80,
        scale: [1, 0.8, 0],
      }}
      transition={{ duration: dur, delay, ease: [0.2, 0, 0.8, 1] }}
    />
  );
}

/* ── Floating ember (continuous) ────────────────────────── */
function FloatingEmber({ delay, x }: { delay: number; x: string }) {
  const [props, setProps] = useState<any>(null);

  useEffect(() => {
    const color = ['#00BFFF', '#00FFFF', '#007FFF'][Math.floor(Math.random() * 3)];
    const dur = 3 + Math.random() * 3;
    const travelY = -(window.innerHeight || 800);
    setProps({ color, dur, travelY });
  }, []);

  if (!props) return null;

  return (
    <motion.div
      className="absolute bottom-0 rounded-full pointer-events-none"
      style={{ left: x, width: 4, height: 4, background: props.color, boxShadow: `0 0 8px ${props.color}` }}
      animate={{ y: [0, props.travelY], opacity: [0, 1, 0] }}
      transition={{ duration: props.dur, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

/* ── Confetti ring ──────────────────────────────────────── */
function RingBurst() {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      initial={{ scale: 0, opacity: 0.8, width: 0, height: 0 }}
      animate={{ scale: 1, opacity: 0, width: 400, height: 400, marginLeft: -200, marginTop: -200 }}
      transition={{ duration: 1.2, ease: [0, 0, 0.2, 1] }}
      style={{ border: '2px solid #00BFFF', position: 'absolute' }}
    />
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') ?? `ORD-${Math.floor(Math.random() * 9000) + 1000}`;

  const [burst, setBurst] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (orderId) {
      sessionStorage.setItem(`order_verified_${orderId}`, 'true');
    }
    const t1 = setTimeout(() => setBurst(true), 300);
    const t2 = setTimeout(() => setShowDetails(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [orderId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glow */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,191,255,0.08) 0%, transparent 60%)' }}
      />

      {/* Continuous floating embers */}
      {mounted && [...Array(15)].map((_, i) => (
        <FloatingEmber key={i} delay={i * 0.3} x={`${5 + i * 6}%`} />
      ))}

      {/* Center burst */}
      <div className="relative">
        {/* Ember explosion */}
        {burst && [...Array(30)].map((_, i) => <Ember key={i} i={i} />)}

        {/* Ring bursts */}
        {burst && [0, 0.2, 0.4].map((d, i) => (
          <motion.div key={i} initial={false} transition={{ delay: d }}>
            <RingBurst />
          </motion.div>
        ))}

        {/* Central icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
          className="relative w-28 h-28 flex items-center justify-center mb-8"
          style={{ background: 'linear-gradient(135deg,#007FFF,#00BFFF,#00FFFF)', borderRadius: '16px',
                   boxShadow: '0 0 60px rgba(0,191,255,0.5), 0 0 120px rgba(0,127,255,0.3)' }}
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl select-none"
          >
            ❄️
          </motion.span>

          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ border: '2px solid #00BFFF' }}
          />
        </motion.div>
      </div>

      {/* Text content */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 180 }}
            className="text-center space-y-4 max-w-lg"
          >
            {/* Order ID */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-ice-blue/5 border border-ice-blue/20 rounded-sm"
            >
              <Zap size={11} className="text-ice-blue fill-ice-blue" stroke="none" />
              <span className="text-[11px] font-mono tracking-widest text-ice-blue">
                {orderId}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[clamp(3rem,12vw,6rem)] font-display tracking-[0.04em] leading-none bg-gradient-to-br from-[#007FFF] via-[#00BFFF] to-[#00FFFF] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,191,255,0.4)]"
            >
              PEDIDO CONFIRMADO!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="text-black/60 dark:text-white/40 leading-relaxed font-body font-light text-[1rem]"
            >
              Seu pedido foi registrado com sucesso! <br/>
              <span className="text-ice-blue font-bold">Pagamento Recebido e Confirmado.</span>
              <br />
              <span className="text-[11px] opacity-70">Você receberá o código de rastreio por e-mail em breve.</span>
            </motion.p>

            {/* Steps */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="grid grid-cols-3 gap-3 mt-6"
            >
              {[
                { icon: <CheckCircle size={20} className="text-ice-blue" />, label: 'Pagamento OK',   sub: 'Confirmado' },
                { icon: '📦', label: 'Preparação',     sub: 'Em andamento' },
                { icon: '🚀', label: 'Envio',         sub: 'Em breve' },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="p-3 text-center bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-sm"
                >
                  <div className="text-xl mb-1">{step.icon}</div>
                  <p className="text-[11px] font-body text-black/70 dark:text-white/60 leading-tight font-semibold">
                    {step.label}
                  </p>
                  <p className="text-[9px] font-mono text-black/40 dark:text-white/20 mt-0.5">
                    {step.sub}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
            >
              <Link href="/">
                <motion.span
                  whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-body font-bold uppercase tracking-[0.18em] text-black cursor-pointer rounded-sm"
                  style={{ background: 'linear-gradient(135deg,#007FFF,#00BFFF,#00FFFF)' }}
                >
                  <Home size={14} />
                  Voltar para Home
                </motion.span>
              </Link>
              <Link href="/produtos">
                <motion.span
                  whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-all cursor-pointer border border-black/10 dark:border-white/10 font-body font-semibold tracking-[0.18em] text-[0.9rem] rounded-sm"
                >
                  <Package size={14} />
                  Continuar Comprando
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-black/50 dark:text-white/20">Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
