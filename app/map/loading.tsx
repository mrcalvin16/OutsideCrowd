export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          Loading Map
        </p>
      </div>
    </main>
  );
}
