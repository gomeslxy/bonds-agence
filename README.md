<div align="center">
  <img src="https://images.unsplash.com/photo-1552061081-998da20455d6?w=1200&q=80" width="100%" alt="Bonds Agence Banner" />
  
  # ⚡ BONDS AGENCE V4 ⚡
  ### *Sportlife VFX & Streetwear Premium*
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-black?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-black?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](LICENSE)

  **A nova geração do e-commerce de streetwear. Estética agressiva, performance extrema.**

  [Explorar Coleção](https://bonds-agence.vercel.app) · [Painel Admin](https://bonds-agence.vercel.app/admin) · [Reportar Bug](https://github.com/gomeslxy/bonds-agence/issues)
</div>

---

## ⚡ A Experiência
A **Bonds Agence** não é apenas uma loja, é um movimento. O site foi construído para refletir a velocidade e a cultura **Sportlife**, utilizando efeitos de brilho (glow), animações fluidas com **Framer Motion** e uma paleta de cores monocromática com detalhes em **Fire Orange**.

### 🛠️ Core Features
- **🛒 Checkout Inteligente**: Fluxo de compra otimizado com validação matemática de CPF e máscaras de input dinâmicas.
- **🛡️ Segurança Hardened**: Rate Limiting via **Upstash Redis** em todas as rotas críticas (Login, Signup, Admin e Verificação).
- **📊 Admin Dashboard**: Painel completo para gestão de estoque, controle de pedidos em tempo real e criação de cupons.
- **📡 Realtime Engine**: Sincronização instantânea entre o banco de dados e a interface do usuário.
- **📧 Automação de E-mails**: Sistema integrado via **Supabase Edge Functions** para notificações de status de pedido e recuperação de conta.
- **🔐 Auth SSR**: Fluxo de autenticação seguro rodando inteiramente no servidor (Next.js Server Actions).

---

## 🧬 Tech Stack

| Camada | Tecnologia |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Estilização** | Tailwind CSS + Vanilla CSS |
| **Banco de Dados** | PostgreSQL (Supabase) |
| **Autenticação** | Supabase Auth (PKCE Flow) |
| **Realtime** | Supabase Realtime Channels |
| **VFX / Motion** | Framer Motion + Lucide Icons |
| **Performance** | Upstash Redis (Serverless) |

---

## 🚀 Guia de Início Rápido

### 1. Requisitos
- Node.js 18+
- Conta no Supabase
- Conta no Upstash (Redis)

### 2. Instalação
```bash
# Clone o projeto
git clone https://github.com/gomeslxy/bonds-agence.git

# Instale as dependências
npm install
```

### 3. Configuração
Utilize o arquivo `.env.example` como base para configurar suas variáveis de ambiente no `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Execução
```bash
npm run dev
```

---

## 🔒 Segurança & Hardening
Este projeto foi auditado e configurado para máxima segurança em ambientes de produção:
- **RLS (Row Level Security)**: Políticas estritas no PostgreSQL garantem que usuários só acessem seus próprios dados.
- **Middleware Protection**: Verificação de sessão administrativa em nível de borda (Edge).
- **Anti-Brute Force**: Bloqueio automático de IPs após múltiplas tentativas falhas.
- **No Hardcoded Secrets**: Zero tokens ou senhas no código fonte.

---

<div align="center">
  <p align="center">
    Criado com ❤️ por <a href="https://github.com/gomeslxy">Lucas Gomes</a><br>
    © 2026 Bonds Agence · Todos os direitos reservados.
  </p>
  <img src="https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80" width="200" alt="Sportlife Vibe" style="border-radius: 10px; opacity: 0.5;" />
</div>
