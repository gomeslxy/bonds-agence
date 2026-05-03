'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Key, ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import { verifyEmail, resendOTP, checkVerificationStatus } from '../actions'
import { fireToast } from '@/components/ToastVFX'

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''
  
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!email) {
      router.push('/signup')
      return
    }
    let subscription: any

    const setupAuthListener = async () => {
      // 1. Checa direto no banco de dados (bypassa cache de sessão local)
      const { verified } = await checkVerificationStatus(email)
      if (verified) {
        router.push('/')
        return
      }

      // 2. Fallback pro listener normal caso ele consiga logar enquanto está na tela
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
        return
      }

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || session) {
          router.push('/')
        }
      })
      subscription = data.subscription
    }
    
    setupAuthListener()

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [email, router])

  // Timer logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    if (countdown > 0 || resending) return
    setResending(true)
    const result = await resendOTP(email)
    if (result.error) {
      fireToast('Erro', result.error, 'error')
    } else {
      fireToast('Sucesso', 'Um novo código foi enviado!', 'success')
      setCountdown(60)
    }
    setResending(false)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    // Aceita apenas números
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6)
    if (!pastedData) return

    const newCode = [...code]
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char
    })
    setCode(newCode)

    // Focus last filled or next empty
    const nextIndex = Math.min(pastedData.length, 5)
    document.getElementById(`code-${nextIndex}`)?.focus()
  }

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]
    // Aceita apenas números
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = code.join('').trim()
    if (token.length < 6) return

    setLoading(true)
    setError(null)

    const cleanEmail = email.trim().toLowerCase()

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      // Tentativa de fallback: em alguns projetos configurados com redirect, o Supabase trata o OTP de signup como magiclink
      let verifyResult = await supabase.auth.verifyOtp({ email: cleanEmail, token, type: 'signup' })
      
      if (verifyResult.error) {
        console.log('Signup type failed, trying magiclink fallback...')
        verifyResult = await supabase.auth.verifyOtp({ email: cleanEmail, token, type: 'magiclink' })
      }

      const { error } = verifyResult;
      
      if (error) {
        console.error('Client verify error:', error)
        setError(`Código incorreto ou expirado (${error.message})`)
        setLoading(false)
      } else {
        fireToast('Sucesso', 'Conta verificada com sucesso!', 'success')
        router.push('/')
      }
    } catch (err: any) {
      setError('Erro de conexão ao verificar código.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, rgba(0,191,255,0.08) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl p-8 rounded-2xl border border-black/5 dark:border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#007FFF,#00FFFF)', borderRadius: '12px' }}
            >
              <Key size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-display tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] to-[#00FFFF] mb-2">
              VERIFICAR CONTA
            </h1>
            <p className="text-[10px] text-black/40 dark:text-white/30 tracking-[0.2em] uppercase font-mono">Enviamos um código para {email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div 
              className="grid grid-cols-6 gap-2"
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-full h-14 text-center text-xl font-bold bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg focus:border-cyan-500 outline-none transition-all"
                  maxLength={1}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 font-mono text-center">{error}</p>
            )}

            <button
              disabled={loading || code.some(d => !d)}
              className="w-full py-4 bg-gradient-to-r from-[#007FFF] to-[#00FFFF] text-black rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verificar Código <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="text-xs text-cyan-500 hover:underline flex items-center gap-2 mx-auto font-mono disabled:opacity-50 disabled:no-underline"
            >
              {resending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}
              {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
