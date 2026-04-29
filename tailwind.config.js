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
        brand: {
          white:  '#FFFFFF',
          light:  '#F5F5F5',
          gray:   '#999999',
          dark:   '#111111',
          black:  '#000000',
          accent: '#FFFFFF',
        },
        bonds: {
          black:  '#000000',
          dark:   '#050505',
          card:   '#0A0A0A',
          border: '#1A1A1A',
          glass:  'rgba(255,255,255,0.02)',
        },
      },
      fontFamily: {
        display:  ['var(--font-display)', 'Inter', 'sans-serif'],
        body:     ['var(--font-body)', 'Inter', 'sans-serif'],
        mono:     ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #000000 0%, #111111 100%)',
        'glass-gradient':   'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'shine-gradient':   'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)',
        'noise':            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'premium-sm':  '0 2px 8px rgba(0,0,0,0.4)',
        'premium-md':  '0 4px 16px rgba(0,0,0,0.6)',
        'premium-lg':  '0 8px 32px rgba(0,0,0,0.8)',
        'glass-border': 'inset 0 0 0 1px rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease-out forwards',
        'slide-up':     'slideUp 0.5s ease-out forwards',
        'float':        'float 6s ease-in-out infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
        'pulse-soft':   'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
        xl: '20px',
      },
    },
  },
  plugins: [],
};
