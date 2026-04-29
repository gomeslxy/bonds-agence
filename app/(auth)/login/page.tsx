'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectTo = searchParams.get('redirectTo') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('E-mail ou senha inválidos. Tente novamente.');
      setLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
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
      {/* Ambient glow */}
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
            <Shield size={26} className="text-black" />
          </div>
          <h1 className="text-4xl font-display text-white tracking-[0.2em] uppercase italic font-black">
            ACESSO
          </h1>
          <div className="w-12 h-px bg-white/20 mx-auto mt-3 mb-4" />
          <p className="text-[10px] text-white/30 tracking-[0.3em] font-mono uppercase">
            Bonds Agence
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
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
              autoComplete="email"
              className={inputClass}
            />
          </motion.div>

          {/* Senha */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors">
              <Lock size={15} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex justify-end"
          >
            <Link
              href="/forgot-password"
              className="text-[10px] text-white/30 hover:text-white font-mono uppercase tracking-widest transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </motion.div>

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
                AUTENTICANDO...
              </>
            ) : (
              <>
                ENTRAR
                <ArrowRight size={14} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col items-center gap-4 border-t border-white/5 pt-8"
        >
          <p className="text-[11px] text-white/30 font-mono uppercase tracking-widest">
            Não tem conta?{' '}
            <Link href="/register" className="text-white hover:text-white/70 transition-colors underline underline-offset-2">
              Cadastre-se
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
