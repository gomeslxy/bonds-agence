import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Usa domínio próprio se configurado, senão usa o domínio de testes do Resend
// Para enviar para qualquer e-mail em produção, configure RESEND_FROM_EMAIL com seu domínio verificado
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bonds Agence <onboarding@resend.dev>';

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY não configurada. E-mail não enviado.');
    return { data: null, error: null };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { data, error: null };
  } catch (error) {
    console.error('Resend Error:', error);
    return { data: null, error };
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #FF4500;">Bem-vindo à Bonds Agence, ${name}!</h1>
      <p>Sua conta foi criada com sucesso. Estamos felizes em ter você conosco.</p>
      <p>Explore nossas coleções exclusivas e aproveite o melhor do streetwear.</p>
      <a href="https://bonds.com.br" style="display: inline-block; padding: 12px 24px; background-color: #FF4500; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver Loja</a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">Bonds Agence · Premium Streetwear</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Bem-vindo à Bonds Agence!', html });
};

export const sendOrderCreatedEmail = async (email: string, order: any) => {
  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.size})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}x</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #FF4500;">Pedido Recebido!</h1>
      <p>Olá, ${order.customer_name}. Recebemos seu pedido <strong>#${order.id.slice(0, 8)}</strong>.</p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0; font-size: 18px;">Resumo do Pedido</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding: 10px; font-weight: bold;">Total</td>
            <td style="padding: 10px; font-weight: bold; text-align: right;">R$ ${order.total_price.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #fff4f0; border: 1px solid #ff4500; padding: 20px; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #ff4500;">Pagamento via PIX</h3>
        <p>Para concluir sua compra, realize o pagamento via PIX no aplicativo do seu banco.</p>
        <p><strong>Status:</strong> Aguardando Validação do Pix</p>
        <p style="font-size: 12px;">A validação é feita manualmente em até 24h úteis.</p>
      </div>

      <p style="margin-top: 30px;">Dúvidas? Responda este e-mail ou entre em contato pelo nosso Instagram.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">Bonds Agence · V4 Production</p>
    </div>
  `;
  return sendEmail({ to: email, subject: `Pedido #${order.id.slice(0, 8)} Recebido - Bonds Agence`, html });
};

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #FF4500;">Redefinição de Senha</h1>
      <p>Você solicitou a redefinição de sua senha na Bonds Agence.</p>
      <p>Clique no botão abaixo para escolher uma nova senha:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #FF4500; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Redefinir Senha</a>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">Se você não solicitou isso, pode ignorar este e-mail.</p>
      <p style="font-size: 12px; color: #666;">Este link expira em breve.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">Bonds Agence</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Redefinição de Senha - Bonds Agence', html });
};
