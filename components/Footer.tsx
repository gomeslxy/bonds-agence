import { Zap, Instagram } from 'lucide-react';
import Logo from '@/components/Logo';

const links = {
  Loja: ['Corta-Ventos', 'Conjuntos', 'Kits Refletivos', 'Regatas', 'Acessórios'],
  Suporte: ['Meus Pedidos', 'Tamanhos', 'Trocas & Devoluções', 'FAQ'],
  Empresa: ['Nossa História', 'Collab', 'Trabalhe Conosco'],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-black/[0.04] dark:border-white/[0.04] pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #00BFFF44, transparent)' }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-start justify-start text-left">
            <div className="mb-6">
              <Logo size="md" />
            </div>
            <p
              className="text-black/50 dark:text-white/30 text-sm leading-relaxed mb-6 font-body font-light"
            >
              Vista-se como um mito.<br />
              Sportlife & Streetwear premium.
            </p>
            <div className="w-full flex justify-start">
              <a
                href="https://www.instagram.com/bonds.agence"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-black/10 dark:border-white/10
                           text-black/40 dark:text-white/40 hover:text-ice-blue dark:hover:text-ice-blue hover:border-ice-blue/40 hover:scale-110 hover:-translate-y-0.5 active:scale-95 transition-all rounded-sm"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div
              key={title}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
            >
              <h4
                className="text-[10px] font-mono tracking-[0.3em] uppercase mb-5 text-ice-blue"
              >
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => {
                  const href = item === 'Meus Pedidos' ? '/orders' : 
                               item === 'Corta-Ventos' || item === 'Conjuntos' || item === 'Kits Refletivos' || item === 'Regatas' || item === 'Acessórios' ? '/produtos' : '#';
                  return (
                    <li key={item}>
                      <a
                        href={href}
                        className="text-sm font-body text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors duration-200"
                      >
                        {item}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p
            className="text-[10px] text-black/30 dark:text-white/20 font-mono"
          >
            © 2025 Bonds Agence. Todos os direitos reservados.
          </p>
          <p
            className="text-[10px] text-black/20 dark:text-white/10 font-mono"
          >
            SÃO PAULO, BRASIL
          </p>
        </div>
      </div>
    </footer>
  );
}
