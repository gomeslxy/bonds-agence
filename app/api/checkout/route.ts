import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ratelimit } from '@/lib/ratelimit';
import { validateCPF } from '@/lib/utils';
import { getPaymentProvider } from '@/lib/payments/service';
import { createClient } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail } from '@/lib/email/gmail';

export async function POST(req: Request) {
  try {
    const supabaseServer = createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Você deve estar logado para realizar um pedido.' }, { status: 401 });
    }

    const origin = req.headers.get('origin');
    const host = req.headers.get('host');

    // CSRF Protection
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
      const { data: couponData } = await supabaseServer
        .from('coupons')
        .select('*')
        .eq('code', coupon.toUpperCase())
        .single();
      
      if (couponData) {
        const isExpired = couponData.expiration_date && new Date(couponData.expiration_date) < new Date();
        if (!isExpired) {
          discountPercent = couponData.discount_percent;
          appliedCoupon = couponData.code;
          await supabaseServer.from('coupons').update({ usage_count: (couponData.usage_count || 0) + 1 }).eq('id', couponData.id);
        }
      }
    }

    // Recalculate total
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const shippingPrice = total_price - subtotal;
    const discountAmount = subtotal * (discountPercent / 100);
    const finalTotal = subtotal + shippingPrice - discountAmount;

    // 1. Rate Limit
    if (!isTestCoupon && body.payMethod !== 'pix') {
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 1 minuto.' }, { status: 429 });
      }
    }

    // 2. Validation
    if (!isTestCoupon && !validateCPF(customer_cpf)) {
      return NextResponse.json({ error: 'CPF Inválido.' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    // 3. Create Order
    const initialStatus = isTestCoupon ? 'Pago' : 'Pendente';

    const { data: order, error: orderError } = await supabaseServer
      .from('orders')
      .insert([{
        user_id: user.id,
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

    // 4. Enviar E-mail de Confirmação (Gmail)
    sendOrderConfirmationEmail(customer_email, order).catch(console.error); // fire-and-forget, não bloqueia checkout

    // 5. Handle Payment Provider
    // For now, even if they send 'card', we might want to force 'pix' if Stripe is not ready.
    // But we'll respect the payMethod and use the architecture.
    const provider = getPaymentProvider(isTestCoupon ? 'pix' : payMethod);
    const session = await provider.createSession({
      ...order,
      customer_email,
      items
    });

    return NextResponse.json(session);
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
