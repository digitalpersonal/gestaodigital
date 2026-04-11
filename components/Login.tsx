
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (password: string) => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulação de delay de rede para feedback visual
    setTimeout(() => {
      onLogin(password);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-200 mb-6 text-4xl">
            ⚡
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Digital Freeshop</h1>
          <p className="text-slate-500 mt-2 font-medium">Painel de Controle Administrativo</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border shadow-2xl shadow-slate-200/50 animate-in zoom-in duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">E-mail do Administrador</label>
              <input 
                type="email" 
                disabled
                value="digitalpersonal@gmail.com"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-medium outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Senha de Acesso</label>
              <div className="relative">
                <input 
                  autoFocus
                  required
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-12 py-3.5 bg-slate-50 border ${error ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50'} rounded-2xl outline-none transition-all font-mono`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {error && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{error}</p>}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

            <div className="mt-8 pt-6 border-t border-slate-50 text-center space-y-3">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${isSupabaseConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                {isSupabaseConfigured ? 'Supabase Pronto' : 'Supabase não configurado'}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Acesso restrito a pessoal autorizado</p>
            </div>
        </div>
        
        <div className="text-center mt-8 text-xs text-slate-400 font-medium space-y-1">
          <p>&copy; 2026 Desenvolvido por Multiplus - Sistemas Inteligentes</p>
          <p>Silvio T. de Sá Filho</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
