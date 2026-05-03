// app/api/coupons/validate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código não fornecido' }, { status: 400 });
    }

    // Debug coupon: active in all environments if set
    if (process.env.TEST_COUPON_CODE) {
      const debugCode = process.env.TEST_COUPON_CODE.toLowerCase();
      if (code.toLowerCase() === debugCode) {
        return NextResponse.json({ valid: true, discount: 100, code: debugCode.toUpperCase() });
      }
    }

    // Use server client (has correct cookie context, uses anon key + RLS)
    const supabase = await createClient();
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('code, discount_percent, expiration_date') // select only needed columns
      .ilike('code', code)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Cupom inválido' });
    }

    if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Cupom expirado' });
    }

    return NextResponse.json({
      valid: true,
      discount: coupon.discount_percent,
      code: coupon.code,
    });
  } catch {
    return NextResponse.json({ valid: false, error: 'Erro interno' }, { status: 500 });
  }
}
