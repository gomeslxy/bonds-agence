// app/api/admin/order/status/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, getOrderTemplate } from '@/lib/email';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { OrderStatus } from '@/lib/types';

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'dev-secret-change-in-prod-32chars!!'
);
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL || 'la181009@gmail.com';

const VALID_STATUSES: OrderStatus[] = ['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado'];

export async function POST(req: Request) {
  try {
    // 1. Verify admin JWT cookie (set by adminLogin server action)
    const token = (await cookies()).get('admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
    }
    try {
      await jwtVerify(token, ADMIN_SECRET);
    } catch {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 403 });
    }

    // 2. Double-check via Supabase user email (defence in depth)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, status } = body as { orderId: string; status: OrderStatus };

    // 3. Validate status value to prevent arbitrary DB writes
    if (!orderId || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    // 4. Update order
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // 5. Send email notification on payment approval
    if (status === 'Pago') {
      try {
        await sendEmail({
          to:      order.customer_email,
          subject: `Pagamento Aprovado! Pedido #${order.id.slice(0, 8).toUpperCase()} - Bonds Agence`,
          html:    getOrderTemplate(order, 'approved'),
        });
      } catch (emailErr) {
        // Non-fatal: log but don't fail the status update
        console.error('Failed to send approval email:', emailErr);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Status Update Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
