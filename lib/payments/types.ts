export type PaymentMethod = 'pix' | 'stripe' | 'boleto';

export interface CheckoutSession {
  id: string;
  url?: string;
  success: boolean;
  orderId: string;
}

export interface PaymentProvider {
  createSession(order: any): Promise<CheckoutSession>;
}
