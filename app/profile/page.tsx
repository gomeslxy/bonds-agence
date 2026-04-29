'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, ArrowLeft, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login?redirectTo=/profile');
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
    window.location.reload();
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-white/5 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-white/10">
      <Navbar />
      
      <div className="fixed inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-black/30 dark:text-white/20 hover:text-black dark:hover:text-white transition-colors mb-8 group font-mono text-[10px] tracking-widest uppercase">
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Voltar para Loja
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-black dark:bg-white rounded-sm flex items-center justify-center text-white dark:text-black shadow-2xl">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-display tracking-tight text-black dark:text-white uppercase italic font-black">
                {user.user_metadata?.full_name || 'Usuário'}
              </h1>
              <p className="text-[10px] text-black/40 dark:text-white/20 font-mono tracking-widest uppercase">Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm">
              <Mail size={16} className="text-black/20 dark:text-white/20 mb-4" />
              <p className="text-[10px] text-black/30 dark:text-white/20 font-mono uppercase mb-1 tracking-widest">E-mail</p>
              <p className="text-sm font-body font-bold">{user.email}</p>
            </div>
            <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm">
              <Shield size={16} className="text-black/20 dark:text-white/20 mb-4" />
              <p className="text-[10px] text-black/30 dark:text-white/20 font-mono uppercase mb-1 tracking-widest">Status da Conta</p>
              <p className="text-sm font-body font-bold">Verificada</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Link 
              href="/orders"
              className="flex items-center justify-between p-6 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm hover:border-black/20 dark:hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <Package size={20} className="text-black/40 dark:text-white/40" />
                <span className="font-display tracking-widest uppercase font-bold italic">Meus Pedidos</span>
              </div>
              <ArrowLeft size={16} className="rotate-180 text-black/20 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

            <button 
              onClick={handleLogout}
              className="flex items-center justify-between p-6 bg-black dark:bg-white border border-transparent rounded-sm hover:bg-black/90 dark:hover:bg-white/90 transition-all group"
            >
              <div className="flex items-center gap-4">
                <LogOut size={20} className="text-white dark:text-black" />
                <span className="font-display tracking-widest uppercase font-bold text-white dark:text-black">Encerrar Sessão</span>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
