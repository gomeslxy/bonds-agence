import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ratelimit } from '@/lib/ratelimit';
import { validateCPF, toCents } from '@/lib/utils';
import { stripe } from '@/lib/stripe';
import { sendEmail, getOrderTemplate } from '@/lib/email';


export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    const origin = req.headers.get('origin');
    const host = req.headers.get('host');

    // CSRF & Origin Protection
    if (origin && !origin.includes(host || '')) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const body = await req.json();
    let { customer_name, customer_email, customer_cpf, items, total_price, coupon, ...address } = body;

    // Rate Limit Protection
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await ratelimit.limit(`checkout_${ip}`);
    if (!success) {
      return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 1 minuto.' }, { status: 429 });
    }


    // 1. Data Sanitization & Validation
    const sanitize = (str: string) => str.replace(/<[^>]*>?/gm, '').trim();
    customer_name = sanitize(customer_name || '');
    customer_email = sanitize(customer_email || '').toLowerCase();

    if (!validateCPF(customer_cpf)) {
      return NextResponse.json({ error: 'CPF Inválido.' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    // 2. Coupon Validation
    let discountPercent = 0;
    let appliedCoupon = null;

    if (coupon) {
      const codeToTest = coupon.trim().toLowerCase();
      const testCode = process.env.TEST_COUPON_CODE?.toLowerCase();

      // Check for hardcoded test coupon first
      if (testCode && codeToTest === testCode) {
        discountPercent = 100;
        appliedCoupon = testCode.toUpperCase();
      } else {
        // Database check
        const { data: couponData } = await supabaseServer
          .from('coupons')
          .select('*')
          .ilike('code', coupon.trim())
          .single();
        
        if (couponData) {
          const isExpired = couponData.expiration_date && new Date(couponData.expiration_date) < new Date();
          if (!isExpired) {
            discountPercent = couponData.discount_percent;
            appliedCoupon = couponData.code;
            
            // Increment usage count
            await supabaseServer.from('coupons').update({ usage_count: (couponData.usage_count || 0) + 1 }).eq('id', couponData.id);
          }
        }
      }
    }

    // 3. Validate items against Database
    const itemIds = items.map((i: any) => i.id);
    const { data: dbProducts, error: dbError } = await supabaseServer
      .from('products')
      .select('id, price, name')
      .in('id', itemIds);

    if (dbError || !dbProducts || dbProducts.length !== items.length) {
      return NextResponse.json({ error: 'Um ou mais produtos do seu carrinho não estão mais disponíveis. Atualize a página.' }, { status: 400 });
    }

    // Replace frontend prices with DB prices for security
    items = items.map((item: any) => {
      const dbProd = dbProducts.find((p: any) => p.id === item.id);
      if (!dbProd) return item; // Safety fallback (though validated above)
      return { ...item, price: dbProd.price, name: dbProd.name };
    });

    // 4. Recalculate Totals (Server-side truth)
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const shippingPrice = subtotal >= 299 ? 0 : 19.90;
    const discountAmount = subtotal * (discountPercent / 100);
    const finalTotal = subtotal + shippingPrice - discountAmount;

    // 5. Create Order in Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('CRITICAL: Supabase keys missing in environment');
      return NextResponse.json({ error: 'Erro de configuração do servidor (Supabase).' }, { status: 500 });
    }

    const { data: order, error: orderError } = await supabaseServer
      .from('orders')
      .insert([{
        user_id: user?.id || null,
        customer_name,
        customer_email,
        customer_cpf,
        items,
        total_price: finalTotal,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon,
        status: finalTotal <= 0 ? 'Pago' : 'Pendente',
        ...address
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Supabase Order Error:', orderError);
      return NextResponse.json({ error: `Erro ao criar pedido: ${orderError.message}` }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin || 'http://localhost:3000';

    // 6. Free Order Bypass (No Stripe Needed)
    if (finalTotal <= 0) {
      // Send "Payment Approved" Email immediately for free orders
      try {
        await sendEmail({
          to: customer_email,
          subject: `Pagamento Aprovado! Pedido #${order.id.slice(0, 8).toUpperCase()}`,
          html: getOrderTemplate(order, 'approved')
        });
      } catch (emailErr) {
        console.error('Failed to send free order email:', emailErr);
      }

      return NextResponse.json({ url: `${siteUrl}/success?id=${order.id}` });
    }

    // 7. Create Stripe Session
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('CRITICAL: Stripe Secret Key missing in environment');
      return NextResponse.json({ error: 'Erro de configuração do servidor (Stripe).' }, { status: 500 });
    }

    try {
      // Recalculate discount based on DB percentage to avoid frontend manipulation
      const actualDiscountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
      const stripeDiscountAmount = Math.round(actualDiscountAmount * 100);

      let stripeDiscounts = undefined;
      
      // If there is a discount, create a dynamic one-time Stripe Coupon
      if (stripeDiscountAmount > 0) {
        const stripeCoupon = await stripe.coupons.create({
          amount_off: stripeDiscountAmount,
          currency: 'brl',
          duration: 'once',
          name: `Cupom: ${appliedCoupon}`,
        });
        stripeDiscounts = [{ coupon: stripeCoupon.id }];
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: customer_email,
        discounts: stripeDiscounts,
        line_items: [
          ...items.map((item: any) => ({
            price_data: {
              currency: 'brl',
              product_data: {
                name: item.name,
                images: item.image ? [item.image] : [],
                description: `TAM: ${item.size} | COR: ${item.color || 'Padrão'}`,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          // Add shipping as a line item if not free
          ...(shippingPrice > 0 ? [{
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'Frete (Entrega)',
              },
              unit_amount: Math.round(shippingPrice * 100),
            },
            quantity: 1,
          }] : []),
        ],
        mode: 'payment',
        success_url: `${siteUrl}/success?id=${order.id}`,
        cancel_url: `${siteUrl}/cart`,
        metadata: {
          orderId: order.id,
        },
      });

      return NextResponse.json({ url: session.url });
    } catch (stripeError: any) {
      console.error('Stripe Session Error:', stripeError);
      return NextResponse.json({ error: `Erro no Stripe: ${stripeError.message}` }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Checkout Generic Error:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o checkout.' }, { status: 500 });
  }
}
