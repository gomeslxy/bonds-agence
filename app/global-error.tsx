'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-white antialiased">
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 px-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-3xl font-bold uppercase tracking-wider text-red-500">
              Erro Crítico
            </h2>
            <p className="max-w-md text-sm text-gray-400">
              Ocorreu um erro inesperado na aplicação.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="rounded-sm bg-orange-600 px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-500"
          >
            Tentar Novamente
          </button>
        </div>
      </body>
    </html>
  );
}
