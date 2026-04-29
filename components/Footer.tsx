import { Zap, Instagram } from 'lucide-react';

const links = {
  Loja: ['Corta-Ventos', 'Conjuntos', 'Kits Refletivos', 'Regatas', 'Acessórios'],
  Suporte: ['Tamanhos', 'Trocas & Devoluções', 'Rastrear Pedido', 'FAQ'],
  Empresa: ['Nossa História', 'Collab', 'Imprensa', 'Trabalhe Conosco'],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-black/[0.04] dark:border-white/[0.04] pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #FF450044, transparent)' }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div
                className="w-7 h-7 flex items-center justify-center rotate-12"
                style={{ background: 'linear-gradient(135deg, #FF0000, #FFA500)', borderRadius: '2px' }}
              >
                <Zap size={13} className="text-black" fill="black" />
              </div>
              <span
                className="text-xl font-display tracking-[0.1em] text-fire-glow"
              >
                BONDS AGENCE
              </span>
            </div>
            <p
              className="text-black/50 dark:text-white/30 text-sm leading-relaxed mb-6 font-body font-light"
            >
              Vista-se como um mito.<br />
              Sportlife & Streetwear premium.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/bonds.agence"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-black/10 dark:border-white/10
                           text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-fire-orange/40 hover:scale-110 hover:-translate-y-0.5 active:scale-95 transition-all rounded-sm"
              >
                <Instagram size={15} />
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
                className="text-[10px] font-mono tracking-[0.3em] uppercase mb-5 text-fire-orange"
              >
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm font-body text-black/50 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-[10px] text-black/30 dark:text-white/20 font-mono"
          >
            © 2025 Bonds Agence. Todos os direitos reservados.
          </p>
          <p
            className="text-[10px] text-black/20 dark:text-white/10 font-mono"
          >
            CNPJ 00.000.000/0001-00 · São Paulo, SP
          </p>
        </div>
      </div>
    </footer>
  );
}
