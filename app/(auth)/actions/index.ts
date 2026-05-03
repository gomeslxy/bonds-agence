'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ratelimit } from '@/lib/ratelimit';
import { SignJWT, jwtVerify } from 'jose';

// ─── Admin JWT ─────────────────────────────────────────────
const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'dev-secret-change-in-prod-32chars!!'
);
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL || 'la181009@gmail.com';

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(ADMIN_SECRET);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, ADMIN_SECRET);
    return true;
  } catch {
    return false;
  }
}

// ─── Auth Actions ──────────────────────────────────────────
export async function login(formData: FormData) {
  const supabase = await createClient();

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const { success: limitOk } = await ratelimit.limit(`login_${ip}`);
  if (!limitOk) return { error: 'Muitas tentativas. Tente novamente mais tarde.' };

  const data = {
    email:    (formData.get('email') as string)?.trim().toLowerCase(),
    password:  formData.get('password') as string,
  };

  if (!data.email || !data.password) {
    return { error: 'Preencha e-mail e senha.' };
  }

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      redirect(`/verify?email=${encodeURIComponent(data.email)}`);
    }
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email ou senha incorretos' };
    }
    return { error: 'Ocorreu um erro ao fazer login. Tente novamente.' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const { success: limitOk } = await ratelimit.limit(`signup_${ip}`);
  if (!limitOk) return { error: 'Muitas tentativas. Tente novamente mais tarde.' };

  const email    = (formData.get('email') as string)?.trim().toLowerCase();
  const password =  formData.get('password') as string;
  const fullName = (formData.get('fullName') as string)?.trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    if (error.message.includes('User already registered') || error.message.includes('already registered')) {
      return { error: 'Este e-mail já está em uso. Se você ainda não verificou a conta, vá em "Entrar" e faça login para receber um novo código.' };
    }
    if (error.message.includes('rate limit')) {
      return { error: 'Muitas tentativas de cadastro. Por favor, aguarde alguns minutos e tente novamente.' };
    }
    return { error: 'Não foi possível criar a conta. Verifique os dados e tente novamente.' };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'Este e-mail já está em uso. Se você ainda não verificou a conta, vá em "Entrar", coloque sua senha e enviaremos um novo código.' };
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyEmail(email: string, token: string) {
  const supabase = await createClient();
  
  const allCookies = (await cookies()).getAll();
  console.log('Cookies in verifyEmail:', allCookies.map(c => c.name).join(', '));
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();
  
  console.log('Verifying OTP for:', cleanEmail, 'Token:', `[${cleanToken}]`);

  const { data, error } = await supabase.auth.verifyOtp({ email: cleanEmail, token: cleanToken, type: 'signup' });
  if (error) {
    console.error('Verify OTP Error:', error);
    return { error: `[DEBUG] ${error.message}` };
  }

  // verifyOtp já estabelece a sessão — apenas revalidar e redirecionar
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function resendOTP(email: string) {
  const supabase = await createClient();

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const { success } = await ratelimit.limit(`resend_otp_${ip}`);
  if (!success) return { error: 'Muitas solicitações. Tente novamente em um minuto.' };

  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) return { error: 'Não foi possível enviar o código. Tente novamente mais tarde.' };
  return { success: 'Novo código enviado!' };
}

export async function adminLogin(formData: FormData) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const { success: limitOk } = await ratelimit.limit(`admin_login_${ip}`);
  if (!limitOk) return { error: 'Muitas tentativas. Tente novamente mais tarde.' };

  const password         = formData.get('password') as string;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    console.error('ADMIN_PASSWORD env var not set');
    return { error: 'Erro de configuração do servidor.' };
  }

  if (password !== expectedPassword) {
    return { error: 'Senha administrativa incorreta.' };
  }

  // Issue a signed JWT instead of a plain boolean cookie
  const token = await createAdminToken();

  (await cookies()).set('admin_session', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24, // 24 hours
    path:     '/',
  });

  redirect('/admin');
}

export async function resetPassword(email: string) {
  const supabase = await createClient();
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const { success: limitOk } = await ratelimit.limit(`reset_pass_${ip}`);
  if (!limitOk) return { error: 'Muitas tentativas. Tente novamente mais tarde.' };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: 'Erro ao processar solicitação. Tente novamente.' };
  return { success: true };
}

export async function updatePassword(password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: 'Erro ao atualizar a senha.' };
  return { success: true };
}

export async function changePassword(current: string, newPass: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) return { error: 'Usuário não autenticado' };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email:    user.email,
    password: current,
  });
  if (signInError) return { error: 'Senha atual incorreta' };

  const { error: updateError } = await supabase.auth.updateUser({ password: newPass });
  if (updateError) return { error: 'Erro ao atualizar a senha.' };

  return { success: 'Senha atualizada com sucesso!' };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete('admin_session');
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function checkVerificationStatus(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { verified: false };
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Lista usuários para encontrar pelo email
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return { verified: false };
    
    const user = users.find(u => u.email === cleanEmail);
    if (user && user.email_confirmed_at) {
      return { verified: true };
    }
    
    return { verified: false };
  } catch {
    return { verified: false };
  }
}
