import { useNavigate } from 'react-router-dom';
import { Sparkles, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030014] flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center space-y-6 z-10 max-w-md">
        <div className="flex justify-center">
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-3xl">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="text-6xl font-extrabold text-white tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-gray-200">Workspace Page Not Found</h2>
        <p className="text-sm text-gray-400">The route or resource you are trying to access does not exist or has been moved.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 py-3 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20"
        >
          <Home className="w-4 h-4" /> Go back home
        </button>
      </div>
    </div>
  );
}
