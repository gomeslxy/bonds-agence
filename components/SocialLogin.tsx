'use client';

import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Chrome } from 'lucide-react';

export function SocialLogin() {
  const supabase = createClient();

  const handleOAuth = async (provider: 'google' | 'apple') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="space-y-3 w-full">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/5 dark:border-white/5"></div>
        </div>
        <span className="relative px-3 bg-white dark:bg-black text-[9px] text-black/30 dark:text-white/20 uppercase tracking-[0.2em] font-mono">
          Ou continue com
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOAuth('google')}
          className="flex items-center justify-center gap-2 py-3 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          {/* Google Icon (Customized) */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.94 0 3.51.68 4.75 1.83l3.54-3.54C18.11 1.39 15.31 0 12 0 7.33 0 3.3 2.69 1.28 6.63l4.13 3.21C6.4 7.21 8.97 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.89 3.01c2.27-2.1 3.53-5.2 3.53-8.83z"
            />
            <path
              fill="#FBBC05"
              d="M5.41 14.17c-.24-.71-.37-1.47-.37-2.25s.13-1.54.37-2.25L1.28 6.63C.46 8.24 0 10.06 0 12c0 1.94.46 3.76 1.28 5.37l4.13-3.2z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3.01c-1.09.73-2.49 1.16-4.04 1.16-3.03 0-5.6-2.17-6.52-5.09l-4.13 3.2C3.3 21.31 7.33 24 12 24z"
            />
          </svg>
          <span className="text-[10px] font-mono uppercase tracking-widest text-black/60 dark:text-white/40">Google</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOAuth('apple')}
          className="flex items-center justify-center gap-2 py-3 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          {/* Apple Icon */}
          <svg className="w-4 h-4 fill-black dark:fill-white" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.96.95-2.06 1.62-3.32 2.01-1.35.43-2.73.43-4.08 0-1.26-.39-2.36-1.06-3.32-2.01C4.46 18.4 3 15.53 3 12.15c0-3.38 1.46-6.25 3.33-8.13.96-.95 2.06-1.62 3.32-2.01 1.35-.43 2.73-.43 4.08 0 1.26.39 2.36 1.06 3.32 2.01C18.92 5.9 20.38 8.77 20.38 12.15c0 3.38-1.46 6.25-3.33 8.13zM12 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          </svg>
          <span className="text-[10px] font-mono uppercase tracking-widest text-black/60 dark:text-white/40">Apple</span>
        </motion.button>
      </div>
    </div>
  );
}
