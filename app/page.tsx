import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CartSidebar from '@/components/CartSidebar';
import SimpleFooter from '@/components/SimpleFooter';

export default function HomePage() {
  return (
    <main className="relative bg-white dark:bg-black h-screen overflow-hidden">
      <CartSidebar />
      <Navbar />
      <Hero />
    </main>
  );
}
