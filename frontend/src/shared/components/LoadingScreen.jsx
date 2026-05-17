const LoadingScreen = ({ label = 'Loading...' }) => (
  <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
    <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-b-[#2563eb] animate-spin" />
    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
  </div>
);

export default LoadingScreen;

