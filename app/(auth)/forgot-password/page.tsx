'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { resetPassword } from '../actions'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const result = await resetPassword(email)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-white rounded-2xl"
            >
              <Shield size={32} className="text-black" />
            </motion.div>
            <h1 className="text-3xl font-display tracking-[0.15em] text-white mb-2 uppercase">
              Recuperar Senha
            </h1>
            <p className="text-[10px] text-white/30 tracking-[0.4em] uppercase font-mono">Resete sua credencial</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-orange-500 outline-none transition-all text-white placeholder:text-white/20"
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-mono"
                >
                  <XCircle size={14} /> {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-4 bg-white text-black rounded-2xl font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2 hover:bg-orange-500 transition-all disabled:opacity-30"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Enviar Link <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">E-mail enviado!</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Verifique sua caixa de entrada (e a pasta de spam) para o link de recuperação.
                </p>
              </div>
              <Link href="/login" className="inline-block text-orange-500 hover:underline font-mono text-xs uppercase tracking-widest">
                Voltar ao Login
              </Link>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link href="/login" className="text-xs text-white/30 hover:text-white font-mono uppercase tracking-widest">
              Lembrei minha senha
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
