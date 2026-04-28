import type { Metadata } from 'next';
import './globals.css';
import ToastVFXProvider from '@/components/ToastVFX';

export const metadata: Metadata = {
  metadataBase: new URL('https://bonds-agence.vercel.app'),
  title: 'BONDS AGENCE – Sportlife & Streetwear Premium',
  description:
    'Vista-se como um mito. Conjuntos, corta-ventos, kits refletivos e acessórios de luxo urbano.',
  keywords: ['streetwear', 'sportlife', 'corta-vento', 'conjuntos', 'bonds', 'agence'],
  openGraph: {
    title: 'BONDS AGENCE',
    description: 'Vista-se como um mito.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased" style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>
        {/* Noise overlay – always on top */}
        <div className="noise-overlay" aria-hidden="true" />
        {/* CRT scanlines */}
        <div className="scanlines" aria-hidden="true" />
        {/* Global toast notifications */}
        <ToastVFXProvider />
        {children}
      </body>
    </html>
  );
}
