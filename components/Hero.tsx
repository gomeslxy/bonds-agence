'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

const STATS = siteConfig.stats;

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black noise-bg"
    >
      {/* Background Elements */}
      <motion.div style={{ scale, opacity }} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-black" />
      </motion.div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} 
      />

      {/* Main Content */}
      <motion.div
        style={{ y: yText, opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center pt-20"
      >
        {/* Top Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <span className="text-[10px] font-mono tracking-[0.5em] text-white/40 uppercase bg-white/5 border border-white/10 px-4 py-2">
            Streetwear Premium Curado
          </span>
        </motion.div>

        {/* Hero Title */}
        <div className="relative mb-8">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(4rem,18vw,16rem)] leading-[0.8] tracking-[-0.05em] select-none italic font-black liquid-text"
          >
            BONDS
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-px bg-white/20 mt-4 max-w-lg mx-auto"
          />
        </div>

        {/* Subtitle / Brand Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6 mb-12"
        >
          <p className="max-w-2xl text-white/50 font-light text-lg sm:text-xl tracking-tight leading-relaxed">
            Redefinindo o conceito de streetwear premium. <br className="hidden sm:block" />
            Design autoral focado em minimalismo e alta performance urbana.
          </p>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <a
            href="/produtos"
            className="btn-premium w-full sm:w-auto"
          >
            <span>VER COLEÇÃO</span>
            <ArrowRight size={16} className="ml-2" />
          </a>
          <a
            href="/produtos"
            className="btn-premium-outline w-full sm:w-auto"
          >
            <span>EXPLORAR DROPS</span>
          </a>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-8 border-t border-white/5 pt-12 max-w-4xl mx-auto"
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="text-center group">
              <div className="text-white text-2xl sm:text-4xl font-bold tracking-tight mb-1 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-white/30 text-[10px] font-mono tracking-widest uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <div className="w-px h-16 bg-gradient-to-b from-white/40 to-transparent" />
        <span className="text-[9px] font-mono tracking-[0.4em] text-white/30 uppercase">
          ROLAR
        </span>
      </motion.div>
    </section>
  );
}
