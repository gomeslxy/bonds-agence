'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Flame, Zap } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

const STATS = siteConfig.stats;

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* ── Background layers ── */}

      {/* Grid lines */}
      <div className="absolute inset-0 hero-grid-lines opacity-60" />

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
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#FF0000' : i % 3 === 1 ? '#FF4500' : '#FFA500',
            boxShadow: `0 0 ${Math.random() * 10 + 4}px currentColor`,
          }}
          animate={{
            y: [0, -120 - (i % 5) * 20],
            x: [0, (i % 4 - 2) * 10],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
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
            className="flex items-center gap-2 text-[11px] tracking-[0.5em] uppercase"
            style={{ fontFamily: "'Space Mono', monospace", color: '#FF4500' }}
          >
            <Flame size={10} fill="#FF4500" />
            NOVA COLEÇÃO 2025
            <Flame size={10} fill="#FF4500" />
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
            className="glitch-text relative text-[clamp(5rem,20vw,18rem)] leading-none tracking-[-0.02em] select-none"
            data-text="BONDS"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
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
            className="text-[clamp(1.2rem,4vw,3rem)] tracking-[0.6em] uppercase text-white/30"
            style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif", fontWeight: 300 }}
          >
            AGENCE
          </span>
          <div
            className="w-2 h-2 rotate-45 flex-shrink-0"
            style={{ background: '#FF4500' }}
          />
          <span
            className="text-[clamp(1.2rem,4vw,3rem)] tracking-[0.6em] uppercase text-white/30"
            style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif", fontWeight: 300 }}
          >
            SPORTLIFE
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-xl mx-auto mb-10 text-white/40 leading-relaxed"
          style={{
            fontFamily: "'Barlow', system-ui, sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
          }}
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
            className="btn-fire inline-flex items-center gap-3 px-8 py-4 font-body font-800 tracking-widest uppercase"
            style={{
              fontFamily: "'Barlow Condensed', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: '0.9rem',
              letterSpacing: '0.15em',
              borderRadius: '2px',
            }}
          >
            <span>Ver os Kits</span>
            <ArrowRight size={16} className="relative z-10" />
          </motion.a>

          <motion.a
            href="#produtos"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="btn-outline-fire inline-flex items-center gap-3 px-8 py-4"
            style={{
              fontFamily: "'Barlow Condensed', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.15em',
              borderRadius: '2px',
            }}
          >
            <Zap size={14} style={{ color: '#FF4500' }} />
            <span className="uppercase text-white/80">Drops da Semana</span>
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
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              >
                {stat.value}
              </div>
              <div
                className="text-white/30 text-xs tracking-widest uppercase mt-1"
                style={{ fontFamily: "'Space Mono', monospace" }}
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
          className="text-[10px] tracking-[0.4em] text-white/20 uppercase"
          style={{ fontFamily: "'Space Mono', monospace" }}
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
