'use client';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'text-xl md:text-2xl',
    md: 'text-3xl md:text-4xl',
    lg: 'text-5xl md:text-6xl',
  };

  return (
    <div className={`relative flex items-center select-none ${className}`}>
      <div className="relative flex items-baseline">
        <span 
          className={`${sizes[size]} font-display tracking-[0.1em] uppercase`}
          style={{
            color: '#00BFFF',
            textShadow: '0 0 10px rgba(0,191,255,0.3)',
          }}
        >
          BONDS
        </span>
        <span className="ml-1 text-[10px] md:text-xs font-mono tracking-[0.3em] text-black/30 dark:text-white/20 uppercase">
          Life
        </span>
      </div>
    </div>
  );
}
