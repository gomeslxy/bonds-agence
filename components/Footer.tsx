import { Instagram, Twitter, Youtube } from 'lucide-react';

const links = {
  Loja: ['Lançamentos', 'Coleções', 'Drops', 'Acessórios'],
  Suporte: ['Meus Pedidos', 'Rastreio', 'Trocas & Devoluções', 'FAQ'],
  Empresa: ['Nossa História', 'Sobre', 'Contato'],
};

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/5 pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex flex-col items-start leading-none mb-8">
              <span className="font-display text-4xl tracking-tighter text-white uppercase italic font-black">
                BONDS
              </span>
              <span className="text-[10px] font-mono tracking-[0.4em] text-white/30 uppercase mt-1">
                AGENCE
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs font-light">
              Elevando o streetwear ao patamar de luxo urbano. Design autoral, qualidade excepcional e exclusividade em cada drop.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/30 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white/30 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white/30 hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-[10px] font-mono tracking-[0.4em] uppercase mb-8 text-white/20">
                {title}
              </h4>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/50 hover:text-white transition-colors duration-300 font-light"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">
              © 2025 BONDS AGENCE
            </p>
            <p className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">
              SÃO PAULO · BRASIL
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-[9px] text-white/10 font-mono uppercase tracking-widest">VISA</span>
            <span className="text-[9px] text-white/10 font-mono uppercase tracking-widest">MASTERCARD</span>
            <span className="text-[9px] text-white/10 font-mono uppercase tracking-widest">PIX</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
