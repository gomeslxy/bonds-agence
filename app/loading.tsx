export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-black/10 dark:border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-ice-blue border-t-transparent" />
      </div>
    </div>
  );
}
