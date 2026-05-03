'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, User, Mail, CreditCard, Lock, Key,
  ArrowLeft, Loader2, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { changePassword } from '@/app/(auth)/actions'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [passData, setPassData] = useState({
    current: '',
    newPass: '',
    confirm: ''
  })

  const [newEmail, setNewEmail] = useState('')
  const [emailConfirm, setEmailConfirm] = useState('')

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (passData.newPass !== passData.confirm) {
      setError('As novas senhas não coincidem.')
      return
    }
    if (passData.newPass.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    setUpdating(true)
    setError(null)
    setSuccess(null)

    const result = await changePassword(passData.current, passData.newPass)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Senha atualizada com sucesso!')
      setPassData({ current: '', newPass: '', confirm: '' })
    }
    setUpdating(false)
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    if (newEmail !== emailConfirm) {
      setError('Os e-mails não coincidem.')
      return
    }

    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      setSuccess('Um link de confirmação foi enviado para o novo e-mail.')
      setNewEmail('')
      setEmailConfirm('')
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar e-mail.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-ice-blue" size={40} />
    </div>
  )

  const metadata = user?.user_metadata || {}

  return (
    <main className="min-h-screen text-black dark:text-white">
      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors mb-8 group font-mono text-[10px] tracking-widest">
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          VOLTAR PARA LOJA
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Sidebar - User Summary */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 p-6 rounded-2xl backdrop-blur-xl"
            >
              <div className="w-20 h-20 bg-ice-gradient rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-ice-md">
                <User size={40} className="text-black" />
              </div>
              <h1 className="text-2xl font-display tracking-wider mb-1">
                {metadata.full_name?.split(' ')[0] || 'Meu'} <span className="text-ice-blue">Perfil</span>
              </h1>
              <p className="text-[10px] text-black/40 dark:text-white/30 font-mono uppercase tracking-[0.2em]">
                {user?.email === 'la181009@gmail.com' ? 'Dono Bonds Agence' : 'Membro Bonds Agence'}
              </p>
            </motion.div>

            <div className="space-y-2">
              <Link href="/orders" className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl hover:border-ice-blue/40 transition-all group">
                <Shield size={18} className="text-black/30 dark:text-white/20 group-hover:text-ice-blue" />
                <span className="text-xs font-mono uppercase tracking-widest">Meus Pedidos</span>
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">

            {/* Info Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-black/30 dark:text-white/20 flex items-center gap-3">
                <span className="w-8 h-px bg-black/10 dark:bg-white/10" /> Informações Pessoais
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-xl">
                  <p className="text-[9px] text-black/30 dark:text-white/30 uppercase font-mono mb-1">Nome Completo</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <User size={14} className="text-ice-blue" /> {metadata.full_name || 'Não informado'}
                  </p>
                </div>
                <div className="p-4 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-xl">
                  <p className="text-[9px] text-black/30 dark:text-white/30 uppercase font-mono mb-1">E-mail</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail size={14} className="text-ice-blue" /> {user.email}
                  </p>
                </div>
                <div className="p-4 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-xl">
                  <p className="text-[9px] text-black/30 dark:text-white/30 uppercase font-mono mb-1">CPF</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <CreditCard size={14} className="text-ice-blue" /> {metadata.cpf || 'Não informado'}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Email Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-6 pt-4"
            >
              <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-black/30 dark:text-white/20 flex items-center gap-3">
                <span className="w-8 h-px bg-black/10 dark:bg-white/10" /> Alterar E-mail
              </h2>

              <form onSubmit={handleEmailChange} className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-8 rounded-2xl space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Mail size={20} className="text-ice-blue" />
                  <h3 className="text-lg font-display tracking-widest uppercase">Novo E-mail</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/10" size={16} />
                    <input
                      type="email"
                      placeholder="Novo E-mail"
                      required
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl focus:border-ice-blue outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/10" size={16} />
                    <input
                      type="email"
                      placeholder="Confirmar Novo E-mail"
                      required
                      value={emailConfirm}
                      onChange={e => setEmailConfirm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl focus:border-ice-blue outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 bg-ice-blue/5 border border-ice-blue/10 rounded-xl">
                  <p className="text-[9px] text-ice-blue uppercase font-mono mb-1">Aviso de Segurança</p>
                  <p className="text-[10px] text-black/50 dark:text-white/40 font-body leading-relaxed">
                    Por segurança, você receberá um link de confirmação no seu e-mail atual ({user.email}) e no novo e-mail informado. A troca só será concluída após a confirmação em ambos.
                  </p>
                </div>

                <button
                  disabled={updating}
                  className="w-full sm:w-auto px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold tracking-widest uppercase text-[10px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="animate-spin" size={16} /> : 'Solicitar Troca de E-mail'}
                </button>
              </form>
            </motion.section>

            {/* Password Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6 pt-4"
            >
              <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-black/30 dark:text-white/20 flex items-center gap-3">
                <span className="w-8 h-px bg-black/10 dark:bg-white/10" /> Segurança
              </h2>

              <form onSubmit={handlePasswordChange} className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-8 rounded-2xl space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Key size={20} className="text-ice-blue" />
                  <h3 className="text-lg font-display tracking-widest uppercase">Alterar Senha</h3>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/10" size={16} />
                    <input
                      type="password"
                      placeholder="Senha Atual"
                      required
                      value={passData.current}
                      onChange={e => setPassData({ ...passData, current: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl focus:border-ice-blue outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/10" size={16} />
                      <input
                        type="password"
                        placeholder="Nova Senha"
                        required
                        value={passData.newPass}
                        onChange={e => setPassData({ ...passData, newPass: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl focus:border-ice-blue outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/10" size={16} />
                      <input
                        type="password"
                        placeholder="Confirmar Nova Senha"
                        required
                        value={passData.confirm}
                        onChange={e => setPassData({ ...passData, confirm: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl focus:border-ice-blue outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-mono">
                      <AlertCircle size={14} /> {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 text-xs font-mono">
                      <CheckCircle2 size={14} /> {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <Link href="/forgot-password" className="text-[10px] text-black/40 dark:text-white/20 hover:text-ice-blue uppercase tracking-widest font-mono">
                    Esqueceu sua senha?
                  </Link>
                  <button
                    disabled={updating}
                    className="w-full sm:w-auto px-8 py-3 bg-ice-gradient text-black rounded-xl font-bold tracking-widest uppercase text-[10px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-lg shadow-ice-sm"
                  >
                    {updating ? <Loader2 className="animate-spin" size={16} /> : 'Atualizar Senha'}
                  </button>
                </div>
              </form>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  )
}
