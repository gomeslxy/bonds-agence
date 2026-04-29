'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/login?message=Senha redefinida com sucesso!'), 2000);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, #FF0000, #FFA500)' }}
        >
          <CheckCircle size={48} className="text-black" />
        </motion.div>
        <h2 className="text-3xl font-display text-white tracking-widest uppercase mb-2">Senha Redefinida!</h2>
        <p className="text-white/40 font-mono text-sm">Redirecionando para o login...</p>
      </motion.div>
    </div>
  );

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
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-2xl"
               style={{ background: 'linear-gradient(135deg, #FF0000, #FFA500)', borderRadius: '4px' }}>
            <Lock size={32} className="text-black" />
          </div>
          <h1 className="text-4xl font-display tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-br from-[#FF0000] via-[#FF4500] to-[#FFA500]">
            NOVA SENHA
          </h1>
          <p className="text-[10px] text-black/40 dark:text-white/20 tracking-widest font-mono mt-2 uppercase">
            Escolha sua nova senha de acesso
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20 group-focus-within:text-fire-orange transition-colors">
              <Lock size={16} />
            </div>
            <input
              type="password"
              placeholder="Nova Senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-black dark:text-white placeholder-black/30 dark:placeholder-white/20 text-sm outline-none focus:border-fire-orange/50 transition-all rounded-sm font-mono"
            />
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20 group-focus-within:text-fire-orange transition-colors">
              <Lock size={16} />
            </div>
            <input
              type="password"
              placeholder="Confirmar Nova Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-black dark:text-white placeholder-black/30 dark:placeholder-white/20 text-sm outline-none focus:border-fire-orange/50 transition-all rounded-sm font-mono"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-red-500 font-mono text-center uppercase tracking-wider"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-fire-red via-fire-orange to-fire-amber text-black font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                SALVANDO...
              </span>
            ) : (
              <>SALVAR NOVA SENHA <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
