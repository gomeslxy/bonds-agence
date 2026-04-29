import type { Metadata } from 'next';
import './globals.css';
import ToastVFXProvider from '@/components/ToastVFX';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Bebas_Neue, Barlow_Condensed, Barlow, Space_Mono } from 'next/font/google';

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' });
const barlowCondensed = Barlow_Condensed({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], variable: '--font-barlow-condensed' });
const barlow = Barlow({ weight: ['300', '400', '500', '600', '700'], subsets: ['latin'], variable: '--font-barlow' });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space' });

export const metadata: Metadata = {
  metadataBase: new URL('https://bonds-agence.vercel.app'),
  title: 'Bonds Agence | Streetwear e Sportlife em Indaiatuba',
  description: 'Loja de roupas streetwear e sportlife em Indaiatuba. Estilo, atitude e peças exclusivas na Bonds Agence. Compre online ou visite a loja.',
  keywords: ["streetwear", "sportlife", "roupas", "Indaiatuba", "moda urbana", "Bonds Agence"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Bonds Agence | Streetwear e Sportlife em Indaiatuba',
    description: 'Loja de roupas streetwear e sportlife em Indaiatuba. Estilo, atitude e peças exclusivas na Bonds Agence. Compre online ou visite a loja.',
    url: 'https://bonds-agence.vercel.app',
    siteName: 'Bonds Agence',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bonds Agence | Streetwear e Sportlife em Indaiatuba',
    description: 'Loja de roupas streetwear e sportlife em Indaiatuba. Estilo, atitude e peças exclusivas na Bonds Agence.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`bg-white dark:bg-black text-black dark:text-white antialiased ${bebas.variable} ${barlowCondensed.variable} ${barlow.variable} ${spaceMono.variable}`} style={{ fontFamily: "var(--font-barlow-condensed), system-ui, sans-serif" }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Noise overlay – always on top */}
          <div className="noise-overlay" aria-hidden="true" />
          {/* Global toast notifications */}
          <ToastVFXProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
