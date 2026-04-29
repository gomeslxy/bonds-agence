'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function VFXBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-white dark:bg-black transition-colors duration-700">
      {/* Dynamic Fluid Waves (SVG based for performance) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <filter id="fluid-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="2" seed="1">
            <animate attributeName="baseFrequency" dur="30s" values="0.005;0.007;0.005" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="30" />
        </filter>
        <rect width="100%" height="100%" filter="url(#fluid-noise)" />
      </svg>

      {/* Floating Dust/VFX Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[1px] h-[1px] bg-black dark:bg-white rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3
            }}
            animate={{
              y: [null, '-20%'],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>

      {/* Ambient Gradient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-black/[0.02] dark:bg-white/[0.02] blur-[120px] rounded-full ambient-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/[0.02] dark:bg-white/[0.02] blur-[120px] rounded-full ambient-pulse" style={{ animationDelay: '2s' }} />

      {/* Floating Wave (CSS based for performance) */}
      <div className="absolute bottom-0 left-0 w-[200%] h-[30vh] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ 
             background: 'radial-gradient(ellipse at center, currentColor 0%, transparent 70%)',
             animation: 'wave 20s linear infinite'
           }} 
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 grid-pattern opacity-[0.2] dark:opacity-[0.1]" />
    </div>
  );
}
