// app/api/order/verify/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ratelimit } from '@/lib/ratelimit';

/** Fields safe to return to the customer — excludes full CPF, admin notes, etc. */
const SAFE_FIELDS =
  'id, status, created_at, customer_name, customer_email, items, total_price, discount_amount, coupon_code, city, state';

function formatCPF(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success } = await ratelimit.limit(`verify_${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { id, query, type } = body;

    if (!id || !query || !type) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    let q = supabase.from('orders').select(SAFE_FIELDS).eq('id', id);

    if (type === 'email') {
      q = q.eq('customer_email', String(query).trim().toLowerCase());
    } else {
      const clean  = String(query).replace(/\D/g, '');
      const masked = formatCPF(clean);
      q = q.or(`customer_cpf.eq.${clean},customer_cpf.eq.${masked}`);
    }

    const { data, error } = await q.single();

    if (error || !data) {
      return NextResponse.json({ error: 'Dados incorretos. Acesso negado.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error('Verify Error:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
