'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Snowflake, Zap, Instagram } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { useMouse } from '@/lib/hooks/useMouse'; // Assuming this hook exists or I'll create it


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
  const { x, y } = useMouse();
  
  // Calculate tilt
  const tiltX = (y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) / 50;
  const tiltY = (x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) / 50;

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-black dark:via-black dark:to-black"
    >
      {/* ── Background layers (VFX) ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dynamic Aurora VFX - High Contrast for Light Mode */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="aurora aurora-1 opacity-30 dark:opacity-10 scale-125" />
          <div className="aurora aurora-2 opacity-25 dark:opacity-10 scale-110" />
          <div className="aurora aurora-3 opacity-30 dark:opacity-15 scale-125" />
        </div>

        {/* Central Radial Glow - More Blue in Light Mode */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(0,191,255,0.15) 0%, rgba(0,127,255,0.05) 50%, transparent 80%)',
          }}
        />
      </div>

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
            background: i % 3 === 0 ? '#00BFFF' : i % 3 === 1 ? '#00FFFF' : '#007FFF',
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pre-title badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <div
            className="h-px w-16 opacity-40"
            style={{ background: 'linear-gradient(90deg, transparent, #00BFFF)' }}
          />
          <span
            className="flex items-center gap-2 text-[11px] font-mono tracking-[0.5em] uppercase text-ice-blue"
          >
            <Snowflake size={10} className="text-ice-blue" />
            NOVA COLEÇÃO 2026
            <Snowflake size={10} className="text-ice-blue" />
          </span>
          <div
            className="h-px w-16 opacity-40"
            style={{ background: 'linear-gradient(90deg, #00BFFF, transparent)' }}
          />
        </motion.div>

        {/* Main Title – Bonds life with stable gradient animation */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-block mb-2 select-none"
        >
          <h1
            className="font-script relative text-[clamp(4rem,12vw,10rem)] leading-[1.2] tracking-normal py-2 text-ice-glow"
            style={{
              background: 'linear-gradient(135deg, #00BFFF 0%, #007FFF 40%, #00FFFF 80%, #007FFF 100%)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'iceText 3s linear infinite',
            }}
          >
            Bonds life
          </h1>
          
          {/* Title underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-2 left-0 right-0 h-0.5 origin-left"
            style={{
              background: 'linear-gradient(90deg, #00BFFF, #007FFF, #00FFFF)',
              boxShadow: '0 0 15px #00BFFF, 0 0 30px #007FFF',
            }}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-center justify-center gap-8 mb-6"
        >
          <span
            className="text-[clamp(1rem,3vw,2.5rem)] font-body tracking-[0.6em] uppercase text-black/80 dark:text-white font-bold"
          >
            AGENCE
          </span>
          <span
            className="text-[clamp(1rem,3vw,2.5rem)] font-body tracking-[0.6em] uppercase text-black/80 dark:text-white font-bold"
          >
            SPORTLIFE
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-xl mx-auto mb-10 text-black/60 dark:text-white/70 leading-relaxed font-body font-light text-[clamp(0.85rem,1.5vw,1.1rem)] animate-fade-in-up"
        >
          Vista-se como um mito. Corta-ventos, conjuntos e kits refletivos
          feitos para os que vivem além do limite.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col items-center justify-center gap-4 mb-8 max-w-sm mx-auto"
        >
          <motion.a
            href="/produtos"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-ice-gradient flex items-center justify-center gap-3 w-full py-5 font-body font-extrabold tracking-[0.2em] uppercase text-[1rem] rounded-sm text-white shadow-ice-lg"
          >
            <span>Explorar Coleção</span>
            <ArrowRight size={18} className="relative z-10" />
          </motion.a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-center justify-center gap-8 sm:gap-16 mb-12"
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
                className="text-ice-glow text-3xl sm:text-4xl font-display leading-none"
              >
                {stat.value}
              </div>
              <div
                className="text-black/40 dark:text-white/30 text-[9px] tracking-[0.3em] uppercase mt-1 font-mono"
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Integrated Footer - Absolute bottom */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-8 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col items-start gap-1 pointer-events-auto">
          <p className="text-[11px] text-black/60 dark:text-white/50 uppercase tracking-[0.25em] font-mono font-bold">
            Streetwear / Sportlife
          </p>
          <a 
            href="https://www.instagram.com/bonds.agence" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 group transition-all"
          >
            <div className="p-2 rounded-full bg-ice-gradient shadow-ice-sm group-hover:shadow-ice-md group-hover:scale-110 transition-all">
              <Instagram size={14} className="text-white" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest font-black text-blue-900 dark:text-ice-blue group-hover:text-ice-azure transition-colors">
              Instagram
            </span>
          </a>
        </div>

        <p className="text-[10px] text-black/80 dark:text-white/80 font-mono uppercase tracking-[0.2em] text-right pointer-events-auto">
          © 2026 BONDS AGENCE
        </p>
      </div>
    </section>
  );
}
