import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, getOrderTemplate } from '@/lib/email';
import type Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // 1. Update Order Status to 'Pago'
      const { data: order, error } = await supabase
        .from('orders')
        .update({ status: 'Pago' })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error(`Failed to update order ${orderId}:`, error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // 2. Send "Payment Received" Email
      if (order) {
        try {
          await sendEmail({
            to: order.customer_email,
            subject: `Pagamento Confirmado! Pedido #${order.id.slice(0, 8).toUpperCase()}`,
            html: getOrderTemplate(order, 'approved')
          });
        } catch (emailErr) {
          console.error('Failed to send payment email:', emailErr);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
