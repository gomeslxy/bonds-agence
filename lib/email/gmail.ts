import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // App Password do Google, não a senha normal
  },
});

const BASE_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #fff; }
  </style>
`;

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${BASE_STYLES}
</head>
<body style="background:#0a0a0a; padding: 0; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a; min-height:100vh;">
    <tr><td align="center" style="padding: 40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #FF0000, #FF4500, #FFA500); padding: 3px; border-radius: 8px 8px 0 0;">
            <div style="background:#111; border-radius: 6px 6px 0 0; padding: 28px 32px; text-align: center;">
              <span style="font-size: 28px; font-weight: 900; letter-spacing: 8px; background: linear-gradient(135deg, #FF0000, #FF4500, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">BONDS</span>
              <span style="color: rgba(255,255,255,0.3); font-size: 10px; letter-spacing: 5px; display: block; margin-top: 4px; text-transform: uppercase;">AGENCE</span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background: linear-gradient(135deg, #FF0000, #FF4500, #FFA500); padding: 0 3px;">
            <div style="background: #111; padding: 40px 32px;">
              ${content}
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background: linear-gradient(135deg, #FF0000, #FF4500, #FFA500); padding: 3px; border-radius: 0 0 8px 8px;">
            <div style="background: #0a0a0a; border-radius: 0 0 6px 6px; padding: 20px 32px; text-align: center;">
              <p style="color: rgba(255,255,255,0.2); font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">
                BONDS AGENCE · Premium Streetwear
              </p>
              <p style="color: rgba(255,255,255,0.1); font-size: 10px; margin-top: 8px;">
                bonds-agence.vercel.app
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(email: string, order: any) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[Email] Gmail não configurado. Pedido não notificado.');
    return;
  }

  const fmt = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`;

  const itemsRows = (order.items || []).map((item: any) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #fff; font-size: 14px;">${item.name}${item.size ? ` <span style="color:rgba(255,255,255,0.4); font-size:12px;">(${item.size})</span>` : ''}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); font-size: 13px; text-align:center;">${item.quantity}×</td>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #FF4500; font-size: 14px; font-weight: 600; text-align:right;">${fmt(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const content = `
    <h1 style="font-size: 26px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;">
      Pedido <span style="color: #FF4500;">Recebido!</span>
    </h1>
    <p style="color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 32px;">
      #${String(order.id).slice(0, 8).toUpperCase()}
    </p>
    <p style="color: rgba(255,255,255,0.7); font-size: 15px; margin-bottom: 32px;">
      Olá, <strong style="color:#fff;">${order.customer_name}</strong>! Seu pedido foi registrado com sucesso.
    </p>

    <!-- Items -->
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 20px; margin-bottom: 24px;">
      <p style="color: rgba(255,255,255,0.3); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px;">Resumo do Pedido</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemsRows}
        <tr>
          <td colspan="2" style="padding: 16px 0 0; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Total</td>
          <td style="padding: 16px 0 0; color: #FF4500; font-size: 20px; font-weight: 900; text-align: right;">${fmt(order.total_price)}</td>
        </tr>
      </table>
    </div>

    <!-- PIX Instructions -->
    <div style="background: rgba(255,69,0,0.08); border: 1px solid rgba(255,69,0,0.25); border-radius: 6px; padding: 24px; margin-bottom: 32px;">
      <p style="color: #FF4500; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px;">⚡ Pagamento via PIX</p>
      <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
        Realize o pagamento no seu banco e <strong>aguarde a validação manual</strong> (até 24h úteis).
      </p>
      <p style="color: rgba(255,255,255,0.4); font-size: 12px;">Status: <span style="color: #FFA500; font-weight: 600;">Aguardando PIX</span></p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/order/${order.id}" style="display: inline-block; background: linear-gradient(135deg, #FF0000, #FF4500, #FFA500); color: #000; font-weight: 700; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border-radius: 4px;">
      Ver Detalhes do Pedido →
    </a>
  `;

  await transporter.sendMail({
    from: `"Bonds Agence" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `🔥 Pedido #${String(order.id).slice(0, 8).toUpperCase()} Recebido — Bonds Agence`,
    html: emailWrapper(content),
  });
}
