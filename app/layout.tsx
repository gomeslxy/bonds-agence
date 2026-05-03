import type { Metadata, Viewport } from 'next';
import './globals.css';
import ToastVFXProvider from '@/components/ToastVFX';
import { ThemeProvider } from '@/components/ThemeProvider';
import AnimatedBackground from '@/components/AnimatedBackground';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Bebas_Neue, Barlow_Condensed, Barlow, Space_Mono, Satisfy } from 'next/font/google';

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' });
const barlowCondensed = Barlow_Condensed({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], variable: '--font-barlow-condensed' });
const barlow = Barlow({ weight: ['300', '400', '500', '600', '700'], subsets: ['latin'], variable: '--font-barlow' });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space' });
const satisfy = Satisfy({ weight: '400', subsets: ['latin'], variable: '--font-satisfy' });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bonds-agence.vercel.app'),
  title: {
    default: 'Bonds Agence | Streetwear e Sportlife em Indaiatuba',
    template: '%s | Bonds Agence'
  },
  description: 'Loja de roupas streetwear e sportlife em Indaiatuba. Estilo, atitude e peças exclusivas na Bonds Agence. Compre online ou visite a loja física.',
  keywords: ["streetwear", "sportlife", "roupas", "Indaiatuba", "moda urbana", "Bonds Agence", "vestuário", "estilo de rua", "corta-ventos", "kits refletivos"],
  authors: [{ name: 'Bonds Agence' }],
  creator: 'Bonds Agence',
  publisher: 'Bonds Agence',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Bonds Agence | Streetwear e Sportlife',
    description: 'Estilo, atitude e peças exclusivas na Bonds Agence em Indaiatuba. Compre streetwear e sportlife com as melhores condições.',
    url: '/',
    siteName: 'Bonds Agence',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bonds Agence - Streetwear e Sportlife',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bonds Agence | Streetwear e Sportlife',
    description: 'Estilo, atitude e peças exclusivas na Bonds Agence em Indaiatuba.',
    images: ['/og-image.jpg'],
  },
  verification: {
    // google: 'seu-codigo-de-verificacao-aqui', // Uncomment and set when Search Console is created
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`bg-white dark:bg-black text-black dark:text-white antialiased ${bebas.variable} ${barlowCondensed.variable} ${barlow.variable} ${spaceMono.variable} ${satisfy.variable}`} style={{ fontFamily: "var(--font-barlow-condensed), system-ui, sans-serif" }}>
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID as string} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Animated Background Auroras */}
          <AnimatedBackground />
          {/* Noise overlay – always on top */}
          <div className="noise-overlay" aria-hidden="true" />
          {/* Global toast notifications */}
          <ToastVFXProvider />
          <main id="main-content">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
