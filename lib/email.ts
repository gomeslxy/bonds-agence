// lib/email.ts
// Envia e-mails via Supabase Edge Function.
// NUNCA importar createBrowserClient aqui — este módulo roda no servidor.
import { createAdminClient } from '@/lib/supabase/admin';

/** Escapa HTML básico para prevenir visual injection no template de e-mail. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Usa admin client (service role) para chamar a Edge Function sem depender de cookies
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email Error via Supabase Function:', message);
    return { error: message };
  }
}

export function getOrderTemplate(order: any, type: 'confirmed' | 'approved'): string {
  const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const statusTitle = type === 'confirmed' ? 'PEDIDO CONFIRMADO' : 'PAGAMENTO APROVADO';
  const statusMsg   =
    type === 'confirmed'
      ? 'Seu pedido foi recebido com sucesso e está aguardando aprovação do pagamento.'
      : 'Seu pagamento foi aprovado! Estamos preparando seus produtos com todo cuidado para o envio.';

  // Sanitize user-controlled data before inserting into HTML
  const safeName    = escapeHtml(order.customer_name ?? '');
  const safeOrderId = escapeHtml((order.id ?? '').slice(0, 8).toUpperCase());
  const safeTotal   = Number(order.total_price ?? 0).toFixed(2);
  const safeOrderLink = `${siteUrl}/order/${encodeURIComponent(order.id ?? '')}`;

  const itemsHtml = (Array.isArray(order.items) ? order.items : [])
    .map(
      (item: any) => `
    <div style="display:flex;gap:15px;margin-bottom:15px;padding-bottom:15px;border-bottom:1px solid #222;">
      <div style="flex-shrink:0;">
        <img src="${escapeHtml(item.image ?? '')}" alt="${escapeHtml(item.name ?? '')}" style="width:60px;height:80px;object-fit:cover;border-radius:4px;">
      </div>
      <div style="flex:1;">
        <h4 style="margin:0;color:#fff;font-size:14px;">${escapeHtml(item.name ?? '')}</h4>
        <p style="margin:5px 0;color:#666;font-size:12px;">TAM: ${escapeHtml(item.size ?? '')} | QTD: ${Number(item.quantity)}</p>
        <p style="margin:0;color:#00BFFF;font-size:14px;font-weight:bold;">R$ ${(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
      </div>
    </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body{font-family:sans-serif;background:#000;color:#fff;margin:0;padding:0}
    .container{max-width:600px;margin:0 auto;background:#0a0a0a;border:1px solid #1a1a1a}
    .header{background:linear-gradient(135deg,#007FFF,#00FFFF);padding:40px;text-align:center}
    .content{padding:40px}
    .footer{padding:20px;text-align:center;font-size:12px;color:#444;border-top:1px solid #111}
    h1{margin:0;font-size:20px;letter-spacing:4px;text-transform:uppercase;color:#000}
    h2{color:#00BFFF;font-size:24px;margin-bottom:10px}
    p{color:#888;line-height:1.6}
    .order-box{background:#111;padding:20px;border-radius:8px;margin:25px 0;border:1px solid #222}
    .btn{display:inline-block;padding:15px 30px;background:linear-gradient(135deg,#007FFF,#00FFFF);color:#000;text-decoration:none;border-radius:4px;font-weight:bold;text-transform:uppercase;margin-top:20px}
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>BONDS AGENCE</h1></div>
    <div class="content">
      <h2>${statusTitle}</h2>
      <p>Olá, <strong>${safeName}</strong>!</p>
      <p>${statusMsg}</p>
      <div class="order-box">
        <p style="margin-top:0;font-size:12px;color:#555;">PEDIDO #${safeOrderId}</p>
        ${itemsHtml}
        <div style="margin-top:20px;text-align:right;">
          <p style="margin:0;font-size:12px;color:#555;">TOTAL DO PEDIDO</p>
          <p style="margin:5px 0 0;font-size:24px;color:#fff;font-weight:bold;">R$ ${safeTotal}</p>
        </div>
      </div>
      <div style="text-align:center;">
        <a href="${safeOrderLink}" class="btn">Acompanhar Pedido</a>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Bonds Agence. Streetwear e Sportlife em Indaiatuba.<br>
      Siga-nos no Instagram <a href="https://instagram.com/bonds.agence" style="color:#666;">@bonds.agence</a>
    </div>
  </div>
</body>
</html>`;
}
