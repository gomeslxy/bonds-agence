import { PaymentProvider, CheckoutSession } from './types';

export class PixProvider implements PaymentProvider {
  async createSession(order: any): Promise<CheckoutSession> {
    // For manual Pix, we just return success and the order ID.
    // The frontend already shows the QR code and instructions.
    return {
      id: order.id,
      success: true,
      orderId: order.id
    };
  }
}
