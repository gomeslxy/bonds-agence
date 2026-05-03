'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { adminLogin } from '@/app/(auth)/actions'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await adminLogin(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, rgba(0,127,255,0.05) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl p-8 rounded-2xl border border-black/5 dark:border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-xl bg-ice-gradient shadow-lg shadow-ice-blue/20">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-display tracking-[0.1em] text-transparent bg-clip-text bg-ice-gradient mb-2">
              ADMIN LOGIN
            </h1>
            <p className="text-[10px] text-black/40 dark:text-white/30 tracking-[0.3em] uppercase font-mono">Acesso Restrito</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" size={18} />
                <input
                  name="password"
                  type="password"
                  placeholder="Senha Administrativa"
                  required
                  autoFocus
                  className="w-full pl-12 pr-4 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:border-ice-blue/50 outline-none transition-all text-black dark:text-white"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-mono text-center">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full py-4 bg-ice-gradient text-white rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg shadow-ice-blue/20 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Autenticando...
                </span>
              ) : (
                <React.Fragment>
                  Acessar Painel <ArrowRight size={18} />
                </React.Fragment>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
