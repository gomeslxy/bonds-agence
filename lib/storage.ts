// lib/storage.ts
// Abstração sobre localStorage com fallback seguro para SSR.
// Usado pelo Admin e pelas API Routes (via JSON em memória no server).

import { products as defaultProducts, type Product } from '@/data/products';

const PRODUCTS_KEY = 'bonds_products';
const ORDERS_KEY   = 'bonds_orders';

/* ─── Tipos ────────────────────────────────────────────── */
export type OrderStatus = 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  'Pendente': 'Pendente',
  'Pago': 'Pago',
  'Enviado': 'Enviado',
  'Entregue': 'Entregue',
  'Cancelado': 'Cancelado',
};

export const STATUS_STYLES: Record<OrderStatus, { bg: string; color: string; border: string }> = {
  'Pendente':  { bg: 'rgba(255,165,0,0.1)',  color: '#FFA500', border: 'rgba(255,165,0,0.3)' },
  'Pago':      { bg: 'rgba(74,222,128,0.1)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
  'Enviado':   { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
  'Entregue':  { bg: 'rgba(255,255,255,0.05)',color: '#fff',    border: 'rgba(255,255,255,0.1)' },
  'Cancelado': { bg: 'rgba(255,0,0,0.1)',    color: '#FF4444', border: 'rgba(255,0,0,0.3)' },
};

export interface OrderItem {
  id:       string;
  name:     string;
  size:     string;
  color:    string;
  price:    number;
  quantity: number;
  image:    string;
}

export interface Order {
  id:         string;
  createdAt:  string;           // ISO string
  status:     OrderStatus;
  customer: {
    name:         string;
    email:        string;
    cpf:          string;
    cep:          string;
    address:      string;
    number:       string;
    complement?:  string;
    neighborhood: string;
    city:         string;
    state:        string;
  };
  items:      OrderItem[];
  subtotal:   number;
  shipping:   number;
  total:      number;
  payMethod:  'card' | 'pix' | 'boleto';
}

/* ─── Helpers ───────────────────────────────────────────── */
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded — silently fail */ }
}

/* ─── Products ──────────────────────────────────────────── */
export function getStoredProducts(): Product[] {
  return safeGet<Product[]>(PRODUCTS_KEY, defaultProducts);
}

export function saveProducts(products: Product[]) {
  safeSet(PRODUCTS_KEY, products);
}

export function upsertProduct(product: Product) {
  const list = getStoredProducts();
  const idx  = list.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    list[idx] = product;
  } else {
    list.unshift(product); // novos ficam no topo
  }
  saveProducts(list);
  return list;
}

export function deleteProduct(id: string) {
  const list = getStoredProducts().filter((p) => p.id !== id);
  saveProducts(list);
  return list;
}

export function resetProducts() {
  saveProducts(defaultProducts);
  return defaultProducts;
}

/* ─── Orders ────────────────────────────────────────────── */
export function getStoredOrders(): Order[] {
  return safeGet<Order[]>(ORDERS_KEY, generateMockOrders());
}

export function saveOrder(order: Order) {
  const list = getStoredOrders();
  list.unshift(order);
  safeSet(ORDERS_KEY, list);
  return list;
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const list = getStoredOrders().map((o) =>
    o.id === id ? { ...o, status } : o
  );
  safeSet(ORDERS_KEY, list);
  return list;
}

/* ─── Mock orders (aparece no admin na primeira vez) ────── */
function generateMockOrders(): Order[] {
  const ALL_STATUSES: OrderStatus[] = ['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado'];
  const names  = ['Lucas Ferreira', 'Ana Clara', 'Pedro Rocha', 'Camila Santos', 'Diego Oliveira'];
  const emails = ['lucas@mail.com', 'anaclara@mail.com', 'pedro@mail.com', 'camila@mail.com', 'diego@mail.com'];
  const methods: Order['payMethod'][] = ['pix', 'card', 'card', 'boleto', 'pix'];

  return ALL_STATUSES.map((status, i) => {
    const total = 349.9 + i * 80;
    return {
      id:        `ORD-${1000 + i}`,
      createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
      status,
      customer: {
        name:  names[i],
        email: emails[i],
        cpf:   '000.000.000-00',
        cep:   `0100${i}-000`,
        address: 'Rua Exemplo',
        number: '123',
        neighborhood: 'Centro',
        city:  'São Paulo',
        state: 'SP',
      },
      items: [
        {
          id:       'p001',
          name:     'CORTA-VENTO IGNITE',
          size:     'M',
          color:    'Preto Meia-Noite',
          price:    349.9,
          quantity: 1,
          image:    'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400&q=80',
        },
      ],
      subtotal:  total,
      shipping:  total >= 299 ? 0 : 19.9,
      total:     total >= 299 ? total : total + 19.9,
      payMethod: methods[i],
    };
  });
}
