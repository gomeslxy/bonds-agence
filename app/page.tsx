import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TickerBanner from '@/components/TickerBanner';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import { siteConfig } from '@/config/siteConfig';

export default function HomePage() {
  return (
    <main className="relative bg-black min-h-screen">
      {/* Persistent cart sidebar (renders on top of everything) */}
      <CartSidebar />

      {/* Navigation */}
      <Navbar />

      {/* Hero – full viewport */}
      <Hero />

      {/* Scrolling ticker */}
      <TickerBanner />

      {/* Products section */}
      <ProductGrid />

      {/* Feature callout band */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]"
               style={{ background: 'radial-gradient(ellipse at center, rgba(255,69,0,0.04) 0%, transparent 70%)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
         {siteConfig.features.map((f) => (
    <div key={f.label} className="text-center space-y-2">
      <div className="text-3xl">{f.icon}</div>
      <h4
        className="text-base text-white/80"
        style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
      >
        {f.label}
      </h4>
      <p
        className="text-xs text-white/30"
        style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}
      >
        {f.sub}
      </p>
    </div>
  ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
