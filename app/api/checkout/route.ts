import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { ratelimit } from '@/lib/ratelimit';
import { validateCPF } from '@/lib/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15' as any,
});

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const host = req.headers.get('host');

    // CSRF Protection: Ensure request is from our own domain
    if (origin && !origin.includes(host || '')) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const body = await req.json();
    let { customer_name, customer_email, customer_cpf, items, total_price, coupon, payMethod, ...address } = body;

    const testCoupon = (process.env.TEST_COUPON_CODE || 'agence26s').toLowerCase();
    const isTestCoupon = coupon?.toLowerCase() === testCoupon;

    let discountPercent = 0;
    let appliedCoupon = null;

    if (isTestCoupon) {
      discountPercent = 100;
      appliedCoupon = testCoupon.toUpperCase();
    } else if (coupon) {
      // Validate real coupon from DB
      const { data: couponData } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon.toUpperCase())
        .single();
      
      if (couponData) {
        // Check expiration
        const isExpired = couponData.expiration_date && new Date(couponData.expiration_date) < new Date();
        if (!isExpired) {
          discountPercent = couponData.discount_percent;
          appliedCoupon = couponData.code;
          
          // Increment usage count
          await supabase.from('coupons').update({ usage_count: (couponData.usage_count || 0) + 1 }).eq('id', couponData.id);
        }
      }
    }

    // Recalculate total to be safe
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const shippingPrice = total_price - subtotal; // This assumes total_price already included shipping but no discount
    const discountAmount = subtotal * (discountPercent / 100);
    const finalTotal = subtotal + shippingPrice - discountAmount;

    // 1. Rate Limit Check (Skip for test coupon or manual PIX)
    if (!isTestCoupon && body.payMethod !== 'pix') {
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 1 minuto.' }, { status: 429 });
      }
    }

    // 2. Data Sanitization
    const sanitize = (str: string) => str.replace(/<[^>]*>?/gm, '').trim();
    customer_name = sanitize(customer_name || '');
    customer_email = sanitize(customer_email || '').toLowerCase();

    // 2. Data Validation
    if (!isTestCoupon) {
      if (!validateCPF(customer_cpf)) {
        return NextResponse.json({ error: 'CPF Inválido.' }, { status: 400 });
      }
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    // 3. Create Order in Supabase
    const initialStatus = isTestCoupon ? 'Pago' : 'Pendente';

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name,
        customer_email,
        customer_cpf,
        items,
        total_price: finalTotal,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon,
        status: initialStatus,
        ...address
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. Handle Test Coupon or Manual PIX Bypass
    if (isTestCoupon || body.payMethod === 'pix') {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    // 5. Create Stripe Session (Only for other methods if ever re-enabled)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'],
      customer_email: customer_email,
      line_items: items.map((item: any) => ({
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
      success_url: `${req.headers.get('origin')}/success?id=${order.id}`,
      cancel_url: `${req.headers.get('origin')}/cart`,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
