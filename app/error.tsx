'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-3xl font-display text-black dark:text-white uppercase tracking-wider">
          Ocorreu um erro
        </h2>
        <p className="max-w-md text-sm font-body text-black/60 dark:text-white/60">
          Não foi possível carregar esta página. Verifique sua conexão ou tente novamente.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="btn-ice px-8 py-3 rounded-sm font-body font-bold text-sm tracking-widest uppercase text-white shadow-ice-sm hover:shadow-ice-md transition-all"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
