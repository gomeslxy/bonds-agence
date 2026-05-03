import Logo from '@/components/Logo';
import Link from 'next/link';
import { Instagram } from 'lucide-react';

export default function SimpleFooter() {
  return (
    <footer className="py-6 border-t border-black/5 dark:border-white/5 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
            </div>
            <p className="text-[10px] text-black/40 dark:text-white/30 uppercase tracking-[0.2em] font-mono">
              Streetwear / Sportlife
            </p>
          </div>
          
          <a 
            href="https://www.instagram.com/bonds.agence" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-black/50 dark:text-white/40 hover:text-ice-blue transition-colors group"
          >
            <Instagram size={18} />
            <span className="text-[11px] font-mono uppercase tracking-widest">Instagram</span>
          </a>
        </div>

        <div className="text-center md:text-right">
          <p className="text-[10px] text-black/30 dark:text-white/20 font-mono uppercase tracking-widest">
            © {new Date().getFullYear()} Bonds Agence<br className="md:hidden" /> · Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
