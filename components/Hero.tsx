'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Flame, Zap } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

const STATS = siteConfig.stats;

// Pre-computed static ember data – avoids Math.random() during render (hydration mismatch)
const EMBERS = [
  { w: 4.2, h: 3.8, l: 8,  t: 15, shadow: 8,  dur: 5.2, delay: 0.3 },
  { w: 2.5, h: 5.1, l: 19, t: 72, shadow: 12, dur: 4.8, delay: 1.7 },
  { w: 5.8, h: 2.9, l: 33, t: 44, shadow: 6,  dur: 6.1, delay: 0.9 },
  { w: 3.1, h: 4.4, l: 47, t: 88, shadow: 10, dur: 3.9, delay: 2.4 },
  { w: 4.6, h: 3.2, l: 55, t: 31, shadow: 14, dur: 5.5, delay: 0.6 },
  { w: 2.8, h: 5.5, l: 64, t: 60, shadow: 7,  dur: 4.2, delay: 3.1 },
  { w: 5.2, h: 2.6, l: 72, t: 18, shadow: 11, dur: 6.8, delay: 1.2 },
  { w: 3.7, h: 4.9, l: 81, t: 79, shadow: 9,  dur: 3.6, delay: 0.4 },
  { w: 4.1, h: 3.5, l: 89, t: 50, shadow: 13, dur: 5.9, delay: 2.8 },
  { w: 2.3, h: 5.8, l: 15, t: 93, shadow: 5,  dur: 4.5, delay: 1.5 },
  { w: 5.6, h: 3.0, l: 40, t: 7,  shadow: 15, dur: 7.0, delay: 0.1 },
  { w: 3.4, h: 4.2, l: 96, t: 38, shadow: 8,  dur: 4.0, delay: 3.9 },
];

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black"
    >
      {/* ── Background layers ── */}

      {/* Radial glow center */}
      <motion.div
        style={{ scale }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255,34,0,0.18) 0%, rgba(255,69,0,0.08) 40%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Top fire beam */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-48 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent, #FF4500AA, #FF000066, transparent)',
        }}
      />

      {/* Corner fire accents */}
      <div
        className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(255,69,0,0.12) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at bottom right, rgba(255,69,0,0.12) 0%, transparent 60%)',
        }}
      />

      {/* Floating ember particles */}
      {EMBERS.map((e, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: e.w,
            height: e.h,
            left: `${e.l}%`,
            top: `${e.t}%`,
            background: i % 3 === 0 ? '#FF0000' : i % 3 === 1 ? '#FF4500' : '#FFA500',
            boxShadow: `0 0 ${e.shadow}px currentColor`,
          }}
          animate={{
            y: [0, -120 - (i % 5) * 20],
            x: [0, (i % 4 - 2) * 10],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: e.dur,
            repeat: Infinity,
            delay: e.delay,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* ── Main Content ── */}
      <motion.div
        style={{ y: yText, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Pre-title badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div
            className="h-px w-16 opacity-40"
            style={{ background: 'linear-gradient(90deg, transparent, #FF4500)' }}
          />
          <span
            className="flex items-center gap-2 text-[11px] font-mono tracking-[0.5em] uppercase text-fire-orange"
          >
            <Flame size={10} className="text-fire-orange" />
            NOVA COLEÇÃO 2025
            <Flame size={10} className="text-fire-orange" />
          </span>
          <div
            className="h-px w-16 opacity-40"
            style={{ background: 'linear-gradient(90deg, #FF4500, transparent)' }}
          />
        </motion.div>

        {/* Main Title – BONDS with glitch */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-block mb-4"
        >
          <h1
            className="glitch-text font-display relative text-[clamp(5rem,20vw,18rem)] leading-none tracking-[-0.02em] select-none"
            data-text="BONDS"
            style={{
              background: 'linear-gradient(135deg, #FF0000 0%, #FF4500 40%, #FFA500 80%, #FF4500 100%)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'fireText 3s linear infinite',
              filter: 'drop-shadow(0 0 40px rgba(255,34,0,0.5))',
            }}
          >
            BONDS
          </h1>

          {/* Title underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-2 left-0 right-0 h-0.5 origin-left"
            style={{
              background: 'linear-gradient(90deg, #FF0000, #FF4500, #FFA500)',
              boxShadow: '0 0 10px #FF2200, 0 0 20px #FF4500',
            }}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <span
            className="text-[clamp(1.2rem,4vw,3rem)] font-body tracking-[0.6em] uppercase text-black/40 dark:text-white/30 font-light"
          >
            AGENCE
          </span>
          <div
            className="w-2 h-2 rotate-45 flex-shrink-0 bg-fire-orange"
          />
          <span
            className="text-[clamp(1.2rem,4vw,3rem)] font-body tracking-[0.6em] uppercase text-black/40 dark:text-white/30 font-light"
          >
            SPORTLIFE
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-xl mx-auto mb-10 text-black/60 dark:text-white/40 leading-relaxed font-body font-light text-[clamp(0.9rem,2vw,1.05rem)]"
        >
          Vista-se como um mito. Corta-ventos, conjuntos e kits refletivos
          feitos para os que vivem além do limite.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <motion.a
            href="#produtos"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="btn-fire inline-flex items-center gap-3 px-8 py-4 font-body font-extrabold tracking-[0.15em] uppercase text-[0.9rem] rounded-sm text-white"
          >
            <span>Ver os Kits</span>
            <ArrowRight size={16} className="relative z-10" />
          </motion.a>

          <motion.a
            href="#produtos"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="btn-outline-fire inline-flex items-center gap-3 px-8 py-4 font-body font-bold tracking-[0.15em] text-[0.9rem] rounded-sm"
          >
            <Zap size={14} className="text-fire-orange" />
            <span className="uppercase text-black/80 dark:text-white/80">Drops da Semana</span>
          </motion.a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-center justify-center gap-8 sm:gap-16"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-center"
            >
              <div
                className="text-fire-glow text-3xl sm:text-4xl font-display leading-none"
              >
                {stat.value}
              </div>
              <div
                className="text-black/40 dark:text-white/30 text-xs tracking-widest uppercase mt-1 font-mono"
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Bottom scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span
          className="text-[10px] tracking-[0.4em] text-black/30 dark:text-white/20 uppercase font-mono"
        >
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10"
          style={{
            background: 'linear-gradient(180deg, #FF450066, transparent)',
          }}
        />
      </motion.div>
    </section>
  );
}
