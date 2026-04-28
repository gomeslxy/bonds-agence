'use client';

import { motion } from 'framer-motion';
import { Zap, Instagram, Youtube } from 'lucide-react';

const links = {
  Loja: ['Corta-Ventos', 'Conjuntos', 'Kits Refletivos', 'Regatas', 'Acessórios'],
  Suporte: ['Tamanhos', 'Trocas & Devoluções', 'Rastrear Pedido', 'FAQ'],
  Empresa: ['Nossa História', 'Collab', 'Imprensa', 'Trabalhe Conosco'],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #FF450044, transparent)' }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <div
                className="w-7 h-7 flex items-center justify-center rotate-12"
                style={{ background: 'linear-gradient(135deg, #FF0000, #FFA500)', borderRadius: '2px' }}
              >
                <Zap size={13} className="text-black" fill="black" />
              </div>
              <span
                className="text-xl"
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  letterSpacing: '0.1em',
                  background: 'linear-gradient(135deg, #FF0000, #FF4500, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                BONDS AGENCE
              </span>
            </motion.div>
            <p
              className="text-white/30 text-sm leading-relaxed mb-6"
              style={{ fontFamily: "'Barlow', system-ui, sans-serif", fontWeight: 300 }}
            >
              Vista-se como um mito.<br />
              Sportlife & Streetwear premium.
            </p>
            <div className="flex gap-3">
              {[Instagram, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 flex items-center justify-center border border-white/10
                             text-white/40 hover:text-white hover:border-fire-orange/40 transition-all"
                  style={{ borderRadius: '2px' }}
                >
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items], gi) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: gi * 0.1 }}
            >
              <h4
                className="text-[10px] tracking-[0.3em] uppercase mb-5"
                style={{ fontFamily: "'Space Mono', monospace", color: '#FF4500' }}
              >
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/30 hover:text-white transition-colors duration-200"
                      style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-[10px] text-white/20"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            © 2025 Bonds Agence. Todos os direitos reservados.
          </p>
          <p
            className="text-[10px] text-white/10"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            CNPJ 00.000.000/0001-00 · São Paulo, SP
          </p>
        </div>
      </div>
    </footer>
  );
}
