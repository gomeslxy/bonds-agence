'use client';

import { motion } from 'framer-motion';

const ITEMS = [
  '🔥 FRETE GRÁTIS ACIMA DE R$299',
  '⚡ NOVOS DROPS TODA SEMANA',
  '🔥 PARCELAMENTO EM ATÉ 12X SEM JUROS',
  '⚡ TROCA GRÁTIS EM 30 DIAS',
  '🔥 CORTA-VENTOS COM REFLETIVO 360°',
  '⚡ KITS EXCLUSIVOS BONDS AGENCE',
];

const content = [...ITEMS, ...ITEMS];

export default function TickerBanner() {
  return (
    <div
      className="relative overflow-hidden py-2.5 border-y border-white/[0.04]"
      style={{ background: 'rgba(255,69,0,0.04)' }}
    >
      {/* Gradient fades */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10"
           style={{ background: 'linear-gradient(90deg, black, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10"
           style={{ background: 'linear-gradient(-90deg, black, transparent)' }} />

      <motion.div
        className="flex whitespace-nowrap gap-8"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {content.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 text-[11px] tracking-[0.2em] uppercase flex-shrink-0"
            style={{ fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.4)' }}
          >
            {item}
            <span style={{ color: '#FF450040' }}>///</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
