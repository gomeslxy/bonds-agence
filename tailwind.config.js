/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fire: {
          red:    '#FF0000',
          orange: '#FF4500',
          amber:  '#FFA500',
          yellow: '#FFD700',
          glow:   '#FF2200',
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
      },
      backgroundImage: {
        'fire-gradient':  'linear-gradient(135deg, #FF0000 0%, #FF4500 40%, #FFA500 100%)',
        'fire-radial':    'radial-gradient(ellipse at center, #FF220033 0%, transparent 70%)',
        'fire-glow':      'linear-gradient(180deg, #FF0000 0%, #FF450088 50%, transparent 100%)',
        'dark-glass':     'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'card-shine':     'linear-gradient(135deg, rgba(255,69,0,0.15) 0%, transparent 60%)',
        'noise':          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'fire-sm':  '0 0 10px #FF220066, 0 0 20px #FF450033',
        'fire-md':  '0 0 20px #FF220088, 0 0 40px #FF450055, 0 0 60px #FF450022',
        'fire-lg':  '0 0 40px #FF0000AA, 0 0 80px #FF450066, 0 0 120px #FF450033',
        'fire-xl':  '0 0 60px #FF0000CC, 0 0 120px #FF450099, 0 0 200px #FF220044',
        'inner-fire': 'inset 0 0 30px rgba(255,34,0,0.2), inset 0 0 60px rgba(255,69,0,0.1)',
        'card':     '0 4px 24px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.04)',
      },
      animation: {
        'fire-pulse':    'firePulse 2s ease-in-out infinite',
        'glitch':        'glitch 4s infinite',
        'glitch-2':      'glitch2 4s infinite',
        'float':         'float 6s ease-in-out infinite',
        'scan':          'scan 3s linear infinite',
        'border-fire':   'borderFire 2s linear infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'noise-anim':    'noiseAnim 0.2s infinite',
      },
      keyframes: {
        firePulse: {
          '0%, 100%': { textShadow: '0 0 20px #FF0000, 0 0 40px #FF4500, 0 0 80px #FF2200' },
          '50%':      { textShadow: '0 0 40px #FF0000, 0 0 80px #FF4500, 0 0 120px #FF2200, 0 0 160px #FFA500' },
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
          '91%':           { transform: 'translate(3px)', opacity: '0.8', color: '#FF4500' },
          '92%':           { transform: 'translate(-3px)', opacity: '0.8', color: '#FFA500' },
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
        borderFire: {
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
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
