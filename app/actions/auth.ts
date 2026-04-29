'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ─── Cadastro: Supabase envia OTP de 6 dígitos automaticamente ───────────────
export async function registerAction(formData: { email: string; password: string; name: string }) {
  const { email, password, name } = formData;
  const supabase = createClient();

  // signUp com emailRedirectTo desativado — Supabase envia OTP de 6 dígitos
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      // Sem emailRedirectTo = Supabase usa o fluxo OTP de 6 dígitos
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// ─── Verificar OTP de 6 dígitos ──────────────────────────────────────────────
export async function verifyOtpAction(email: string, token: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (error) {
    console.error('[verifyOtp]', error.message);
    // Tenta também com o tipo 'email' (alguns projetos Supabase enviam como email OTP)
    const { data: data2, error: error2 } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error2) {
      return { error: 'Código inválido ou expirado. Tente novamente.' };
    }
    // Retorna tokens para o cliente setar a sessão manualmente
    return {
      success: true,
      session: data2.session ? {
        access_token: data2.session.access_token,
        refresh_token: data2.session.refresh_token,
      } : null,
    };
  }

  // Retorna tokens para o cliente setar a sessão manualmente
  return {
    success: true,
    session: data.session ? {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    } : null,
  };
}

// ─── Reenviar OTP ────────────────────────────────────────────────────────────
export async function resendOtpAction(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// ─── Solicitar reset de senha ─────────────────────────────────────────────────
export async function forgotPasswordAction(email: string) {
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Supabase envia o e-mail de reset nativamente (template configurado no dashboard)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
  });

  // Por segurança, sempre retornamos sucesso (não revelamos se e-mail existe)
  if (error) console.error('[Reset Password]', error.message);

  return { success: true };
}
