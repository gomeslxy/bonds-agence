# BONDS AGENCE – Sportlife & Streetwear Premium

E-commerce de alta performance focado em vestuário **Sportlife VFX**, unindo estética urbana de luxo com tecnologia moderna. Desenvolvido com **Next.js 13**, **Supabase** (Realtime & Database) e **Stripe** (Payments).

![Bonds Agence Banner](https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80)

## 🚀 Tecnologias
- **Frontend**: Next.js 13.4+ (App Router), React, TailwindCSS.
- **Animações**: Framer Motion (VFX & Glow effects).
- **Backend**: Supabase (PostgreSQL, Realtime, Auth).
- **Pagamentos**: Stripe Integration (Checkout & Webhooks).
- **Segurança**: Upstash Ratelimit (Redis).

## 🛠️ Instalação e Uso Local

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/bonds-agence.git
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**:
   Crie um arquivo `.env.local` na raiz e adicione:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=seu_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_anon_supabase
   STRIPE_SECRET_KEY=sua_key_secret_stripe
   STRIPE_WEBHOOK_SECRET=seu_webhook_secret
   UPSTASH_REDIS_REST_URL=sua_url_upstash
   UPSTASH_REDIS_REST_TOKEN=seu_token_upstash
   ```

4. **Rodar em desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse: [http://localhost:3000](http://localhost:3000)

## 🔒 Segurança
O projeto segue as diretrizes da **OWASP Top 10**, incluindo:
- Content Security Policy (CSP) rigorosa.
- Proteção contra CSRF e XSS.
- Rate Limiting em rotas críticas (Checkout e Login Admin).
- Sanitização de inputs no servidor.

## 📄 Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
