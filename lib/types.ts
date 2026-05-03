// lib/types.ts
// Tipos centralizados do domínio. Importar daqui, não de lib/storage.ts.

export type OrderStatus = 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  Pendente:  'Pendente',
  Pago:      'Pago',
  Enviado:   'Enviado',
  Entregue:  'Entregue',
  Cancelado: 'Cancelado',
};

export const ALL_STATUSES: OrderStatus[] = ['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado'];

export const STATUS_STYLES: Record<OrderStatus, { bg: string; color: string; border: string }> = {
  Pendente:  { bg: 'rgba(0,191,255,0.1)',  color: '#00BFFF', border: 'rgba(0,191,255,0.3)' },
  Pago:      { bg: 'rgba(74,222,128,0.1)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
  Enviado:   { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
  Entregue:  { bg: 'rgba(255,255,255,0.05)',color: '#fff',    border: 'rgba(255,255,255,0.1)' },
  Cancelado: { bg: 'rgba(255,0,0,0.1)',    color: '#FF4444', border: 'rgba(255,0,0,0.3)' },
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
  id:        string;
  createdAt: string;
  status:    OrderStatus;
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
  items:         OrderItem[];
  subtotal:      number;
  shipping:      number;
  discountAmount?: number;
  couponCode?:   string;
  total:         number;
  payMethod:     'card' | 'pix' | 'boleto';
}
