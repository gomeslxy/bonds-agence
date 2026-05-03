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
    '❄️ FRETE GRÁTIS ACIMA DE R$299',
    '⚡ NOVOS DROPS TODA SEMANA',
    '❄️ PARCELAMENTO EM ATÉ 12X SEM JUROS',
    '⚡ TROCA GRÁTIS EM 30 DIAS',
    '❄️ CORTA-VENTOS COM REFLETIVO 360°',
    '⚡ KITS EXCLUSIVOS BONDS AGENCE',
  ],

  features: [
    { icon: '❄️', label: 'Design Exclusivo',  sub: 'Peças únicas, sem repetição' },
    { icon: '⚡', label: 'Entrega 48H',        sub: 'Para todo o Brasil' },
    { icon: '🛡️', label: 'Qualidade Premium', sub: 'Tecidos selecionados' },
    { icon: '♻️', label: 'Troca Grátis',      sub: 'Sem burocracia, 30 dias' },
  ],

  navLinks: [
    { label: 'Drops',  href: '/produtos' },
    { label: 'Kits',   href: '/produtos' },
    { label: 'Collab', href: '#' },
    { label: 'About',  href: '#' },
  ],

  seo: {
    title:       'BONDS AGENCE – Sportlife & Streetwear Premium',
    description: 'Vista-se como um mito. Conjuntos, corta-ventos, kits refletivos e acessórios de luxo urbano.',
    keywords:    ['streetwear', 'sportlife', 'corta-vento', 'conjuntos', 'bonds', 'agence'],
  },

  admin: {
    password: process.env.ADMIN_PASSWORD,
  },
};
