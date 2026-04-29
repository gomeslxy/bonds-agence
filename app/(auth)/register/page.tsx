'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerAction } from '@/app/actions/auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    setError(null);

    const result = await registerAction({ email, password, name });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      const redirectTo = searchParams?.get('redirectTo') || '/';
      router.push(`/verify-email?email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(redirectTo)}`);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all duration-300 font-mono tracking-wide";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
             backgroundSize: '60px 60px'
           }} />
      {/* Ambient glow top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <div className="w-14 h-14 mx-auto mb-6 bg-white flex items-center justify-center">
            <User size={26} className="text-black" />
          </div>
          <h1 className="text-4xl font-display text-white tracking-[0.2em] uppercase italic font-black">
            CADASTRO
          </h1>
          <div className="w-12 h-px bg-white/20 mx-auto mt-3 mb-4" />
          <p className="text-[10px] text-white/30 tracking-[0.3em] font-mono uppercase">
            Crie sua conta · Bonds Agence
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-3">
          {/* Nome */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="relative group"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors">
              <User size={15} />
            </div>
            <input
              type="text"
              placeholder="Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors">
              <Mail size={15} />
            </div>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </motion.div>

          {/* Senha */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="relative group"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors">
              <Lock size={15} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </motion.div>

          {/* Strength hint */}
          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-1 px-1"
            >
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 flex-1 transition-all duration-300 ${
                    password.length >= (i + 1) * 3
                      ? 'bg-white'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </motion.div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-1"
              >
                <div className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                <p className="text-[11px] text-red-400 font-mono uppercase tracking-wider">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 mt-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                CRIANDO CONTA...
              </>
            ) : (
              <>
                CADASTRAR
                <ArrowRight size={14} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col items-center gap-4 border-t border-white/5 pt-8"
        >
          <p className="text-[11px] text-white/30 font-mono uppercase tracking-widest">
            Já tem conta?{' '}
            <Link href="/login" className="text-white hover:text-white/70 transition-colors underline underline-offset-2">
              Entrar
            </Link>
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors font-mono uppercase tracking-widest group"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para a loja
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
