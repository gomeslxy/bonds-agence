import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white px-4">
      <h2 className="text-[clamp(4rem,10vw,8rem)] font-display text-ice-glow mb-4">404</h2>
      <p className="font-body text-xl mb-8 uppercase tracking-widest text-black/60 dark:text-white/60">Página não encontrada</p>
      <Link href="/" className="btn-ice px-8 py-4 font-body font-bold tracking-widest text-sm uppercase rounded-sm text-white">
        <span>Voltar ao Início</span>
      </Link>
    </div>
  );
}
