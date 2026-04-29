import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ratelimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  try {
    const { id, query, type } = await req.json();

    // 1. Rate Limit Check (Brute force protection)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await ratelimit.limit(`verify_${ip}`);
    if (!success) {
      return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 1 minuto.' }, { status: 429 });
    }

    if (!id || !query || !type) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // 2. Database Query
    let q = supabaseAdmin.from('orders').select('*').eq('id', id);
    
    const formatCPF = (v: string) => {
      v = v.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      return v
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    if (type === 'email') {
      q = q.eq('customer_email', query.trim().toLowerCase());
    } else {
      const clean = query.replace(/\D/g, '');
      const masked = formatCPF(clean);
      // Check both masked and unmasked versions
      q = q.or(`customer_cpf.eq.${clean},customer_cpf.eq.${masked}`);
    }

    const { data, error } = await q.single();

    if (error || !data) {
      return NextResponse.json({ error: 'Dados incorretos. Acesso negado.' }, { status: 401 });
    }

    // 3. Success
    return NextResponse.json({ success: true, order: data });

  } catch (error: any) {
    console.error('Verify Error:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
