import Stripe from 'stripe';
import { PaymentProvider, CheckoutSession } from './types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15' as any,
});

export class StripeProvider implements PaymentProvider {
  async createSession(order: any): Promise<CheckoutSession> {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'],
      customer_email: order.customer_email,
      line_items: order.items.map((item: any) => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            images: [item.image],
            description: `Tamanho: ${item.size} | Cor: ${item.color || 'Padrão'}`,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        orderId: order.id,
      },
    });

    return {
      id: session.id,
      url: session.url || undefined,
      success: true,
      orderId: order.id
    };
  }
}
