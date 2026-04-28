import { NextResponse } from 'next/server';
import { ratelimit } from '@/lib/ratelimit';
import { siteConfig } from '@/config/siteConfig';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await ratelimit.limit(`login_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Bloqueado por 1 minuto.' },
        { status: 429 }
      );
    }

    const { password } = await req.json();

    if (password === siteConfig.admin.password) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
