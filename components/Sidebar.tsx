
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: '📊' },
    { id: 'closing', label: 'Fechamento', icon: '📅' },
    { id: 'clients', label: 'Clientes', icon: '👥' },
    { id: 'systems', label: 'Sistemas', icon: '💻' },
    { id: 'payments', label: 'Receitas', icon: '💰' },
    { id: 'expenses', label: 'Despesas', icon: '💸' },
    { id: 'insights', label: 'Insights IA', icon: '✨' }
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        lg:translate-x-0 lg:static lg:inset-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <h1 className="text-xl font-black text-indigo-600 flex items-center gap-2 tracking-tighter italic">
            <span className="text-2xl not-italic">⚡</span> DIGITAL FREESHOP
          </h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
            ✕
          </button>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Navegação</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100 scale-[1.02]'
                  : 'text-slate-500 hover:bg-slate-50 font-semibold'
              }`}
            >
              <span className={`text-xl transition-transform duration-500 ${activeTab === item.id ? 'rotate-[360deg]' : ''}`}>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t bg-slate-50/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-100 flex items-center justify-center font-black text-white text-xs">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-800 truncate uppercase">Admin Global</p>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Conectado
                </p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all uppercase tracking-widest"
            >
              🚪 Sair do Painel
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
