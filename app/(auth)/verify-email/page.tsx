'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, RotateCcw, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtpAction, resendOtpAction } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/client';

export default function VerifyEmailPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const redirectTo = searchParams.get('redirectTo') || '/';
  const supabase = createClient();

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const fullCode = [...newCode].join('');
      if (fullCode.length === 6) handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const fullCode = code.join('');
      if (fullCode.length === 6) handleVerify(fullCode);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (fullCode?: string) => {
    const token = fullCode || code.join('');
    if (token.length !== 6) return;

    setLoading(true);
    setError(null);

    const result = await verifyOtpAction(email, token);

    if (result.error) {
      setError(result.error);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    // Se o servidor retornou tokens, seta a sessão no browser explicitamente
    if (result.session?.access_token && result.session?.refresh_token) {
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
    }

    setSuccess(true);
    setTimeout(() => router.push(redirectTo), 2000);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    await resendOtpAction(email);
    setResending(false);
    setCanResend(false);
    setCountdown(60);
    setError(null);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  if (success) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center px-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1, bounce: 0.4 }}
          className="w-24 h-24 mx-auto mb-8 flex items-center justify-center bg-white"
        >
          <CheckCircle size={48} className="text-black" />
        </motion.div>
        <h2 className="text-4xl font-display text-white tracking-[0.2em] uppercase italic font-black mb-3">
          Verificado!
        </h2>
        <p className="text-white/30 font-mono text-[11px] tracking-[0.3em] uppercase">
          Redirecionando...
        </p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
             backgroundSize: '60px 60px'
           }} />
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="w-14 h-14 mx-auto mb-6 bg-white flex items-center justify-center">
            <ShieldCheck size={28} className="text-black" />
          </div>
          <h1 className="text-4xl font-display text-white tracking-[0.2em] uppercase italic font-black">
            VERIFICAÇÃO
          </h1>
          <div className="w-12 h-px bg-white/20 mx-auto mt-3 mb-4" />
          <p className="text-[10px] text-white/30 tracking-[0.3em] font-mono uppercase">
            Código de 6 dígitos
          </p>
          {email && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Mail size={11} className="text-white/20" />
              <p className="text-[11px] text-white/40 font-mono truncate max-w-[220px]">
                {email}
              </p>
            </div>
          )}
        </motion.div>

        {/* OTP Inputs */}
        <div className="flex gap-2.5 justify-center mb-8">
          {code.map((digit, i) => (
            <motion.input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className={`w-12 h-14 text-center text-2xl font-display font-black outline-none transition-all duration-200
                ${error
                  ? 'bg-red-500/10 border border-red-500/50 text-red-400'
                  : digit
                    ? 'bg-white text-black border border-white'
                    : 'bg-white/5 border border-white/10 text-white focus:border-white/40 focus:bg-white/[0.07]'
                }`}
            />
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <div className="w-1 h-1 rounded-full bg-red-400" />
              <p className="text-[11px] text-red-400 font-mono uppercase tracking-wider">
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verify Button */}
        <motion.button
          onClick={() => handleVerify()}
          disabled={loading || code.join('').length < 6}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 mb-6 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              VERIFICANDO...
            </>
          ) : (
            'CONFIRMAR CÓDIGO'
          )}
        </motion.button>

        {/* Resend */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resending}
              className="flex items-center gap-2 mx-auto text-[11px] text-white/40 hover:text-white transition-colors font-mono uppercase tracking-widest group"
            >
              <RotateCcw size={12} className={`${resending ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {resending ? 'Reenviando...' : 'Reenviar Código'}
            </button>
          ) : (
            <p className="text-[11px] text-white/20 font-mono tracking-widest">
              Reenviar em{' '}
              <span className="text-white/50 font-bold tabular-nums">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Back */}
        <div className="mt-10 text-center border-t border-white/5 pt-8">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors font-mono uppercase tracking-widest group"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-1 transition-transform" />
            Usar outro e-mail
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
