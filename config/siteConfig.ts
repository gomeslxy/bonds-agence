// ─────────────────────────────────────────────────────────────────
//  config/siteConfig.ts  –  FONTE ÚNICA DE VERDADE DA LOJA
//  Altere aqui. Nenhum dado fica hardcoded nos componentes.
// ─────────────────────────────────────────────────────────────────

export const siteConfig = {
  name:        'BONDS AGENCE',
  tagline:     'Vista-se como um mito.',
  description: 'Conjuntos, corta-ventos, kits refletivos e acessórios de luxo urbano.',
  cnpj:        '00.000.000/0001-00',
  city:        'São Paulo, SP',
  year:        '2025',

  social: {
    instagram: 'https://instagram.com/bondsagence',
    youtube:   'https://youtube.com/@bondsagence',
    tiktok:    'https://tiktok.com/@bondsagence',
  },

  // Números do Hero — altere aqui, reflete em todo o site
  stats: [
    { value: '2K+', label: 'Clientes' },
    { value: '98%', label: 'Aprovação' },
    { value: '48H', label: 'Entrega' },
  ],

  shipping: {
    freeThreshold: 299,
    pacDays:       7,
    sedexDays:     2,
    pacPrice:      19.9,
    sedexPrice:    34.9,
  },

  installments: 12,

  ticker: [
    'FRETE GRÁTIS EM COMPRAS ACIMA DE R$299',
    'NEW DROPS: COLEÇÃO URBAN LUXURY DISPONÍVEL',
    'PARCELAMENTO EM ATÉ 12X SEM JUROS',
    'TROCA SEM CUSTO EM ATÉ 30 DIAS',
    'CORTA-VENTOS COM TECNOLOGIA REFLETIVA 360°',
    'KITS EXCLUSIVOS BONDS AGENCE',
  ],

  features: [
    { icon: '✦', label: 'Design Autoral',  sub: 'Peças com tiragem limitada' },
    { icon: '⚡', label: 'Envio Express',    sub: 'Despacho em até 48h' },
    { icon: '◈', label: 'Curadoria Premium', sub: 'Materiais de alta performance' },
    { icon: '↺', label: 'Troca Facilitada',  sub: 'Logística reversa inclusa' },
  ],

  navLinks: [
    { label: 'Coleções', href: '/produtos' },
    { label: 'Kits',     href: '/produtos' },
    { label: 'Drops',    href: '/produtos' },
    { label: 'Sobre',    href: '/sobre' },
  ],

  seo: {
    title:       'BONDS AGENCE | Luxury Streetwear & Sportlife',
    description: 'Curadoria exclusiva de streetwear premium. Conjuntos, corta-ventos e acessórios com design autoral.',
    keywords:    ['luxury streetwear', 'sportlife premium', 'moda urbana', 'bonds agence'],
  },

  admin: {
    password: process.env.ADMIN_PASSWORD || 'bonds2025',
  },
};
