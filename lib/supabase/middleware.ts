import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are missing!');
    return { response: supabaseResponse, user: null };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    // Se o refresh token é inválido, limpar cookies de sessão
    if (error && (
      error.message?.includes('Refresh Token') ||
      error.message?.includes('refresh_token') ||
      error.status === 401
    )) {
      // Limpar todos os cookies do Supabase para forçar re-login limpo
      const cookieNames = request.cookies.getAll()
        .filter(c => c.name.startsWith('sb-'))
        .map(c => c.name)

      for (const name of cookieNames) {
        supabaseResponse.cookies.set(name, '', { maxAge: 0, path: '/' })
      }

      return { response: supabaseResponse, user: null }
    }

    return { response: supabaseResponse, user }
  } catch {
    // Em caso de erro inesperado, retornar sem usuário
    return { response: supabaseResponse, user: null }
  }
}
