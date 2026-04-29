import { PaymentProvider, PaymentMethod } from './types';
import { PixProvider } from './pix';
import { StripeProvider } from './stripe';

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  switch (method) {
    case 'pix':
      return new PixProvider();
    case 'stripe':
      return new StripeProvider();
    default:
      return new PixProvider(); // Fallback to Pix
  }
}
