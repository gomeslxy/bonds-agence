/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ice: {
          blue:   '#00BFFF',
          cyan:   '#00FFFF',
          azure:  '#007FFF',
          deep:   '#1E90FF',
          glow:   '#00E5FF',
        },
        bonds: {
          black:  '#000000',
          dark:   '#0A0A0A',
          card:   '#111111',
          border: '#1A1A1A',
          glass:  'rgba(255,255,255,0.03)',
        },
      },
      fontFamily: {
        display:  ['var(--font-bebas)', 'Impact', 'sans-serif'],
        body:     ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        mono:     ['var(--font-space)', 'monospace'],
        script:   ['var(--font-satisfy)', 'cursive'],
      },
      backgroundImage: {
        'ice-gradient':   'linear-gradient(135deg, #00BFFF 0%, #007FFF 40%, #00FFFF 100%)',
        'ice-radial':     'radial-gradient(ellipse at center, #00E5FF33 0%, transparent 70%)',
        'ice-glow':       'linear-gradient(180deg, #00BFFF 0%, #007FFF88 50%, transparent 100%)',
        'dark-glass':     'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'ice-shine':      'linear-gradient(135deg, rgba(0,191,255,0.15) 0%, transparent 60%)',
        'noise':          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'ice-sm':   '0 0 10px #00BFFF66, 0 0 20px #007FFF33',
        'ice-md':   '0 0 20px #00BFFF88, 0 0 40px #007FFF55, 0 0 60px #00FFFF22',
        'ice-lg':   '0 0 40px #00BFFFAA, 0 0 80px #007FFF66, 0 0 120px #00FFFF33',
        'ice-xl':   '0 0 60px #00BFFFCC, 0 0 120px #007FFF99, 0 0 200px #00E5FF44',
        'inner-ice':  'inset 0 0 30px rgba(0,191,255,0.2), inset 0 0 60px rgba(0,127,255,0.1)',
        'card':     '0 4px 24px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.04)',
      },
      animation: {
        'ice-pulse':     'icePulse 2s ease-in-out infinite',
        'glitch':        'glitch 4s infinite',
        'glitch-2':      'glitch2 4s infinite',
        'float':         'float 6s ease-in-out infinite',
        'scan':          'scan 3s linear infinite',
        'border-ice':    'borderIce 2s linear infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'noise-anim':    'noiseAnim 0.2s infinite',
        'fade-in-up':    'fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        icePulse: {
          '0%, 100%': { textShadow: '0 0 20px #00BFFF, 0 0 40px #007FFF, 0 0 80px #00FFFF' },
          '50%':      { textShadow: '0 0 40px #00BFFF, 0 0 80px #007FFF, 0 0 120px #00FFFF, 0 0 160px #00E5FF' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)', clipPath: 'inset(0 0 0 0)' },
          '91%':           { transform: 'translate(-3px, 1px)', clipPath: 'inset(20% 0 60% 0)' },
          '92%':           { transform: 'translate(3px, -1px)', clipPath: 'inset(60% 0 20% 0)' },
          '93%':           { transform: 'translate(0)', clipPath: 'inset(0 0 0 0)' },
          '94%':           { transform: 'translate(2px, 2px)', clipPath: 'inset(40% 0 40% 0)' },
          '95%':           { transform: 'translate(0)', clipPath: 'inset(0 0 0 0)' },
        },
        glitch2: {
          '0%, 90%, 100%': { transform: 'translate(0)', opacity: '0' },
          '91%':           { transform: 'translate(3px)', opacity: '0.8', color: '#00BFFF' },
          '92%':           { transform: 'translate(-3px)', opacity: '0.8', color: '#00FFFF' },
          '93%':           { transform: 'translate(0)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        borderIce: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        noiseAnim: {
          '0%':   { transform: 'translate(0, 0)' },
          '25%':  { transform: 'translate(-2%, -2%)' },
          '50%':  { transform: 'translate(2%, 2%)' },
          '75%':  { transform: 'translate(-1%, 1%)' },
          '100%': { transform: 'translate(1%, -1%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
