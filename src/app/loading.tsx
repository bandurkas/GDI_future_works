export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-md transition-all duration-500">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500/10 border-b-emerald-500 rounded-full animate-spin [animation-duration:1.5s]" />
      </div>
    </div>
  );
}
