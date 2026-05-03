'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCircle, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react'
import { login } from '../actions'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl p-8 rounded-2xl border border-black/5 dark:border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg,#007FFF,#00BFFF)', boxShadow: '0 8px 24px rgba(0,191,255,0.2)' }}
            >
              <UserCircle size={32} className="text-white" />
            </motion.div>
            <h1 className="text-4xl font-display tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] to-[#00FFFF] mb-2">
              MEMBRO BONDS
            </h1>
            <p className="text-[10px] text-black/40 dark:text-white/30 tracking-[0.3em] uppercase font-mono">Acesse sua conta</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:border-ice-blue/50 outline-none transition-all text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" size={18} />
                <input
                  name="password"
                  type="password"
                  placeholder="Senha"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:border-ice-blue/50 outline-none transition-all text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/10"
                />
              </div>
              <div className="flex justify-end px-1">
                <Link
                  href="/forgot-password"
                  className="text-[10px] text-black/40 dark:text-white/30 hover:text-ice-blue transition-colors uppercase tracking-widest font-mono"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-500 font-mono text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#007FFF] to-[#00BFFF] text-white rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg shadow-ice-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Verificando...
                </span>
              ) : (
                <>Entrar <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 text-center">
            <p className="text-xs text-black/40 dark:text-white/20 font-mono">
              Não tem uma conta?{' '}
              <Link href="/signup" className="text-ice-blue hover:underline">
                Registrar-se
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] text-black/20 dark:text-white/10 font-mono tracking-[0.2em] uppercase">
          Bem-vindo ao Movimento · Bonds Agence
        </p>
      </motion.div>
    </div>
  )
}
