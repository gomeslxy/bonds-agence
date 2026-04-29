import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const supabaseServer = createClient();
    
    if (!code) {
      return NextResponse.json({ error: 'Código não fornecido' }, { status: 400 });
    }

    // 1. Handle hardcoded debug coupon (if env var exists)
    const debugCode = (process.env.TEST_COUPON_CODE || 'agence26s').toLowerCase();
    if (code.toLowerCase() === debugCode) {
      return NextResponse.json({
        valid: true,
        discount: 100,
        code: debugCode.toUpperCase(),
      });
    }

    // 2. Check Supabase for other coupons
    const { data: coupon, error } = await supabaseServer
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Cupom inválido' });
    }

    // 3. Check expiration
    if (coupon.expiration_date) {
      const expiration = new Date(coupon.expiration_date);
      if (expiration < new Date()) {
        return NextResponse.json({ valid: false, error: 'Cupom expirado' });
      }
    }

    return NextResponse.json({
      valid: true,
      discount: coupon.discount_percent,
      code: coupon.code,
    });
  } catch (err) {
    return NextResponse.json({ valid: false, error: 'Erro interno' }, { status: 500 });
  }
}
