'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await forgotPasswordAction(email);

    if (result.success) {
      setMessage('Se o e-mail estiver cadastrado, você receberá um link de redefinição em breve.');
    } else {
      setError('Ocorreu um erro ao processar sua solicitação.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, rgba(255,34,0,0.06) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-br from-[#FF0000] via-[#FF4500] to-[#FFA500]">
            RECUPERAR
          </h1>
          <p className="text-[10px] text-black/40 dark:text-white/20 tracking-widest font-mono mt-2 uppercase">
            Redefina sua senha da Bonds Agence
          </p>
        </div>

        {message ? (
          <div className="bg-black/5 dark:bg-white/5 border border-fire-orange/30 p-6 rounded-sm text-center space-y-4">
            <p className="text-sm font-body text-black/70 dark:text-white/60">{message}</p>
            <Link href="/login" className="inline-block text-[10px] text-fire-orange font-mono uppercase tracking-widest hover:underline">
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20 group-focus-within:text-fire-orange transition-colors">
                <Mail size={16} />
              </div>
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-black dark:text-white placeholder-black/30 dark:placeholder-white/20 text-sm outline-none focus:border-fire-orange/50 transition-all rounded-sm font-mono"
              />
            </div>

            {error && <p className="text-[10px] text-red-500 font-mono text-center uppercase">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-fire-gradient text-black font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'ENVIANDO...' : (
                <>
                  ENVIAR LINK <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] text-black/40 dark:text-white/20 hover:text-black dark:hover:text-white transition-colors font-mono uppercase tracking-widest group">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Voltar para o login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
