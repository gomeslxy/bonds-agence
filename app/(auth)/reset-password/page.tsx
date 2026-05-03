'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, ArrowRight, Loader2, CheckCircle2, XCircle, Info } from 'lucide-react'
import { updatePassword } from '../actions'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const router = useRouter()

  const requirements = [
    { label: 'Mínimo 6 caracteres', met: formData.password.length >= 6 },
    { label: 'Contém um número', met: /\d/.test(formData.password) },
    { label: 'As senhas coincidem', met: formData.password === formData.confirmPassword && formData.confirmPassword !== '' }
  ]

  const canSubmit = requirements.every(r => r.met)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)
    
    const result = await updatePassword(formData.password)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/'), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
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
              Nova Senha
            </h1>
            <p className="text-[10px] text-white/30 tracking-[0.4em] uppercase font-mono">Defina sua nova credencial</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="password"
                    placeholder="Nova Senha"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-cyan-500 outline-none transition-all text-white placeholder:text-white/20"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="password"
                    placeholder="Confirme a Nova Senha"
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-cyan-500 outline-none transition-all text-white placeholder:text-white/20"
                  />
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-white/5 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest mb-1">
                  <Info size={12} /> Segurança da Senha
                </div>
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono">
                    {req.met ? (
                      <CheckCircle2 size={12} className="text-green-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-white/20" />
                    )}
                    <span className={req.met ? 'text-white/80' : 'text-white/30'}>{req.label}</span>
                  </div>
                ))}
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
                disabled={loading || !canSubmit}
                className="w-full py-4 bg-white text-black rounded-2xl font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2 hover:bg-cyan-500 transition-all disabled:opacity-30"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Atualizar Senha <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Senha atualizada!</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Sua senha foi redefinida com sucesso. Redirecionando para a loja...
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
