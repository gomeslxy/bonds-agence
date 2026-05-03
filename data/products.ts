export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: string[];
  hoverImage?: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  features: string[];
  stock: number;
  sizeStock?: { size: string; quantity: number }[];
  created_at?: string;
  tag?: string;
  tagColor?: string;
}

export const categories = [
  'Todos',
  'Corta-Ventos',
  'Conjuntos',
  'Kits Refletivos',
  'Regatas',
  'Acessórios',
] as const;

export const products: Product[] = [
  {
    id: 'p001',
    name: 'CORTA-VENTO IGNITE',
    subtitle: 'Ice Edition',
    price: 349.9,
    originalPrice: 429.9,
    category: 'Corta-Ventos',
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=90',
    tag: 'HOT',
    tagColor: '#00BFFF',
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    colors: [
      { name: 'Preto Meia-Noite', hex: '#0a0a0a' },
      { name: 'Cinza Chumbo', hex: '#2a2a2a' },
      { name: 'Azul Glacial', hex: '#007FFF' },
    ],
    description:
      'Corta-vento premium com forro de microfibra, refletivos 360° e corte aerodinâmico. Design exclusivo Bonds Agence.',
    features: ['Refletivo 360°', 'Impermeável', 'Anti-vento', 'Forro Polar'],
    stock: 48,
  },
  {
    id: 'p002',
    name: 'KIT CONJUNTO PHANTOM',
    subtitle: 'Full Set – Calça + Moletom',
    price: 529.9,
    originalPrice: 679.9,
    category: 'Conjuntos',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=90',
    tag: 'LANÇAMENTO',
    tagColor: '#00FFFF',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'All Black', hex: '#000000' },
      { name: 'Grafite', hex: '#1c1c1c' },
    ],
    description:
      'Conjunto completo oversized com calça jogger e moletom cropped. Tecido premium 400g french terry.',
    features: ['French Terry 400g', 'Oversized Fit', 'Bolsos Ocultos', 'Acabamento Premium'],
    stock: 32,
  },
  {
    id: 'p003',
    name: 'KIT REFLETIVO SPECTRE',
    subtitle: 'Conjunto 3 Peças',
    price: 689.9,
    category: 'Kits Refletivos',
    image:
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=90',
    tag: 'EXCLUSIVO',
    tagColor: '#007FFF',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto Refletivo', hex: '#0a0a0a' },
      { name: 'Azul Tático', hex: '#00BFFF' },
    ],
    description:
      'Kit completo com jaqueta, calça e colete. Faixas refletivas costuradas a mão. Visível a 200m no escuro.',
    features: ['Refletivo 200m', '3 Peças', 'Costura Reforçada', 'Kit Completo'],
    stock: 15,
  },
  {
    id: 'p004',
    name: 'REGATA COURT KING',
    subtitle: 'Basketball Edition',
    price: 159.9,
    category: 'Regatas',
    image:
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=90',
    tag: 'BASQUETE',
    tagColor: '#00FFFF',
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    colors: [
      { name: 'Preto/Gelo', hex: '#000000' },
      { name: 'Branco/Ciano', hex: '#ffffff' },
      { name: 'Azul Royal', hex: '#1a1aff' },
    ],
    description:
      'Regata de basquete com tecido Dri-Fit de alta performance. Corte amplo e alças reforçadas.',
    features: ['Dri-Fit Pro', 'Corte Basketball', 'Secagem Rápida', 'Anti-Odor'],
    stock: 67,
  },
  {
    id: 'p005',
    name: 'CONJUNTO STEALTH RUN',
    subtitle: 'Running & Training',
    price: 399.9,
    originalPrice: 479.9,
    category: 'Conjuntos',
    image:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=90',
    tag: 'NOVO',
    tagColor: '#00BFFF',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto Total', hex: '#000000' },
      { name: 'Verde Tático', hex: '#1a3a1a' },
    ],
    description:
      'Conjunto técnico para corrida e treino. Calça slim-fit com bolso de segurança e camiseta compression.',
    features: ['Compression Tech', 'Bolso Segurança', 'UV Protection', 'Slim Fit'],
    stock: 41,
  },
  {
    id: 'p006',
    name: 'CORTA-VENTO GHOST',
    subtitle: 'Ultra-Leve Edition',
    price: 279.9,
    category: 'Corta-Ventos',
    image:
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&q=90',
    tag: 'SALE',
    tagColor: '#00BFFF',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto Smoke', hex: '#0d0d0d' },
      { name: 'Nude Escuro', hex: '#3d2b1a' },
    ],
    description:
      'Corta-vento ultra-leve 95g. Dobrável em bolso próprio. Ideal para corrida em dias nublados.',
    features: ['95g Ultra-Leve', 'Dobrável', 'Bolso Embutido', 'Repelente'],
    stock: 28,
  },
];
