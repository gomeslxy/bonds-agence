'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Mail, ArrowRight, Loader2, XCircle, User, Eye, EyeOff } from 'lucide-react'
import { signup } from '../actions'
import Link from 'next/link'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  })

  // Password strength
  let strength = 0;
  let strengthText = "";
  let strengthColor = "bg-transparent";

  if (formData.password.length > 0) {
    if (formData.password.length < 6) {
      strength = 1;
      strengthText = "Mínimo 6 caracteres";
      strengthColor = "bg-red-500";
    } else if (!/\d/.test(formData.password)) {
      strength = 2;
      strengthText = "Precisa de pelo menos um número";
      strengthColor = "bg-yellow-500";
    } else {
      strength = 3;
      strengthText = "Senha Forte";
      strengthColor = "bg-green-500";
    }
  }

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';
  const isEmailValid = formData.email.includes('@');
  const isNameValid = formData.fullName.trim().split(' ').length >= 2;

  const canSubmit = strength === 3 && passwordsMatch && isEmailValid && isNameValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitted(true)
    
    if (!canSubmit) return

    setLoading(true)
    setError(null)
    
    const data = new FormData()
    data.append('email', formData.email)
    data.append('password', formData.password)
    data.append('fullName', formData.fullName)

    const result = await signup(data)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md z-10 py-10"
      >
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl p-8 rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#007FFF,#00BFFF)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,191,255,0.2)' }}
            >
              <User size={32} className="text-white" />
            </motion.div>
            <h1 className="text-4xl font-display tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-br from-[#007FFF] to-[#00FFFF] mb-2 uppercase">
              Junte-se ao movimento
            </h1>
            <p className="text-[10px] text-black/40 dark:text-white/30 tracking-[0.4em] uppercase font-mono">Crie sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              
              {/* Nome Completo */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" size={18} />
                <input
                  type="text"
                  placeholder={`Nome Completo ${isSubmitted && !isNameValid ? '*' : ''}`}
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full pl-12 pr-4 py-4 bg-black/5 dark:bg-white/5 border rounded-2xl outline-none transition-all text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 ${isSubmitted && !isNameValid ? 'border-red-500 placeholder:text-red-500/50' : 'border-black/10 dark:border-white/10 focus:border-ice-blue'}`}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" size={18} />
                <input
                  type="email"
                  placeholder={`Seu melhor e-mail ${isSubmitted && !isEmailValid ? '*' : ''}`}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-12 pr-4 py-4 bg-black/5 dark:bg-white/5 border rounded-2xl outline-none transition-all text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 ${isSubmitted && !isEmailValid ? 'border-red-500 placeholder:text-red-500/50' : 'border-black/10 dark:border-white/10 focus:border-ice-blue'}`}
                />
              </div>

              {/* Senha */}
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-black/30 dark:text-white/20" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={`Crie uma senha forte ${isSubmitted && strength !== 3 ? '*' : ''}`}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-12 pr-12 pb-6 pt-4 bg-black/5 dark:bg-white/5 border rounded-2xl outline-none transition-all text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 ${isSubmitted && strength !== 3 ? 'border-red-500 placeholder:text-red-500/50' : 'border-black/10 dark:border-white/10 focus:border-ice-blue'}`}
                />
                
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                {/* Password Strength Indicator */}
                <div className="absolute bottom-2 left-12 right-12 flex flex-col gap-1">
                  <div className="flex gap-1 h-1 w-full">
                    <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${strength >= 1 ? strengthColor : 'bg-black/10 dark:bg-white/10'}`} />
                    <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${strength >= 2 ? strengthColor : 'bg-black/10 dark:bg-white/10'}`} />
                    <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${strength >= 3 ? strengthColor : 'bg-black/10 dark:bg-white/10'}`} />
                  </div>
                  <AnimatePresence>
                    {strength > 0 && strength < 3 && (
                      <motion.span 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`text-[8px] uppercase tracking-widest font-mono text-center ${strength === 1 ? 'text-red-500' : 'text-yellow-500'}`}
                      >
                        {strengthText}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={`Confirme sua senha ${isSubmitted && !passwordsMatch ? '*' : ''}`}
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-12 pr-12 py-4 bg-black/5 dark:bg-white/5 border rounded-2xl outline-none transition-all text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 ${isSubmitted && (!passwordsMatch || formData.confirmPassword === '') ? 'border-red-500 placeholder:text-red-500/50' : 'border-black/10 dark:border-white/10 focus:border-ice-blue'}`}
                />
              </div>
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
              disabled={loading}
              className="w-full mt-2 py-4 bg-gradient-to-r from-[#007FFF] to-[#00BFFF] text-white rounded-2xl font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Criando Conta...
                </span>
              ) : (
                <>Criar Conta <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 text-center">
            <p className="text-xs text-black/40 dark:text-white/30 font-mono">
              Já faz parte do movimento?{' '}
              <Link href="/login" className="text-ice-blue hover:underline">
                Entrar agora
              </Link>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] text-black/40 dark:text-white/10 font-mono tracking-[0.3em] uppercase">
          Nova Geração · Bonds Agence
        </p>
      </motion.div>
    </div>
  )
}
