
import React, { useState, useEffect, useRef } from 'react';
import { Client, ExternalSystem, SubscriptionStatus } from '../types';

interface ClientListProps {
  clients: Client[];
  systems: ExternalSystem[];
  initialFilter?: string;
  onManageClient?: (client: Client) => void;
  onDeleteClient?: (id: string) => void;
  onViewHistory?: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ 
  clients, 
  systems, 
  initialFilter = 'all', 
  onManageClient,
  onDeleteClient,
  onViewHistory 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [systemFilter, setSystemFilter] = useState(initialFilter);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSystemFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = clients.filter(c => {
    const name = c.name || '';
    const email = c.email || '';
    const id = c.id || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSystem = systemFilter === 'all' || c.systemId === systemFilter;
    return matchesSearch && matchesSystem;
  });

  const selectedSystem = systems.find(s => s.id === systemFilter);

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'BRL': return 'R$';
      default: return currency || 'R$';
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 md:p-6 border-b space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-base md:text-lg font-black text-slate-800">Base de Clientes</h3>
              <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                Exibindo {filteredClients.length} de {clients.length} registros
              </p>
            </div>
            {systemFilter !== 'all' && (
              <button 
                onClick={() => setSystemFilter('all')}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-indigo-100 transition-colors border border-indigo-100"
              >
                Limpar Filtro ✕
              </button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Custom System Dropdown Filter */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full sm:w-64 flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border rounded-xl transition-all duration-200 ${
                  isDropdownOpen ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-lg shrink-0">{selectedSystem?.icon || '🌐'}</span>
                  <span className="text-xs font-black text-slate-700 truncate">
                    {selectedSystem ? selectedSystem.name : 'Todos os Sistemas'}
                  </span>
                </div>
                <span className={`text-[10px] text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200 origin-top">
                  <div 
                    onClick={() => { setSystemFilter('all'); setIsDropdownOpen(false); }}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-xs font-bold transition-colors flex items-center gap-3 ${systemFilter === 'all' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                  >
                    <span className="text-base">🌐</span>
                    <span>Todos os Sistemas</span>
                  </div>
                  <div className="h-px bg-slate-100 mx-2 my-1"></div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {systems.map(s => (
                      <div 
                        key={s.id}
                        onClick={() => { setSystemFilter(s.id); setIsDropdownOpen(false); }}
                        className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-xs font-bold transition-colors flex items-center gap-3 ${systemFilter === s.id ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                      >
                        <span className="text-base">{s.icon}</span>
                        <span>{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3.5 top-3 opacity-30 text-xs md:text-sm">🔍</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 text-slate-500 text-[9px] md:text-[10px] uppercase font-black tracking-[0.1em] border-b">
            <tr>
              <th className="px-6 py-4">Cliente / ID</th>
              <th className="px-6 py-4">Sistema / Plano</th>
              <th className="px-6 py-4">Valor Líquido</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                const system = systems.find(s => s.id === client.systemId);
                const netAmount = Math.max(0, client.amount - (client.discount || 0));
                return (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-xs md:text-sm">{client.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-black mt-0.5 tracking-tighter opacity-70 group-hover:opacity-100">#{client.id}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                         <span className="text-lg group-hover:scale-110 transition-transform duration-300">{system?.icon || '💻'}</span>
                         <span className="font-black text-slate-700 text-[10px] md:text-xs">{system?.name}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 font-black uppercase truncate max-w-[150px] italic">{client.planName}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-slate-900 text-xs md:text-sm">
                        {getCurrencySymbol(client.currency || 'BRL')} {netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Vence {new Date(client.nextBillingDate).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <SubscriptionBadge status={client.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1.5 md:gap-2">
                        <button 
                          onClick={() => onManageClient?.(client)}
                          className="p-2.5 text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all shadow-sm border border-amber-100 hover:scale-110 active:scale-95"
                          title="Editar Registro"
                        >
                          ✎
                        </button>
                        <button 
                          onClick={() => onDeleteClient?.(client.id)}
                          className="p-2.5 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all shadow-sm border border-rose-100 hover:scale-110 active:scale-95"
                          title="Remover Cliente"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center opacity-40">
                    <span className="text-4xl mb-3">🔍</span>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest italic">Nenhum cliente atende aos critérios.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SubscriptionBadge: React.FC<{ status: SubscriptionStatus }> = ({ status }) => {
  const labels: Record<string, string> = {
    [SubscriptionStatus.ACTIVE]: 'Ativo', 
    [SubscriptionStatus.CANCELLED]: 'Canc.',
    [SubscriptionStatus.PAUSED]: 'Paus.', 
    [SubscriptionStatus.TRIAL]: 'Teste',
  };
  const styles: Record<string, string> = {
    [SubscriptionStatus.ACTIVE]: 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-50',
    [SubscriptionStatus.CANCELLED]: 'bg-slate-100 text-slate-500 border-slate-200 shadow-slate-50',
    [SubscriptionStatus.PAUSED]: 'bg-amber-100 text-amber-700 border-amber-200 shadow-amber-50',
    [SubscriptionStatus.TRIAL]: 'bg-sky-100 text-sky-700 border-sky-200 shadow-sky-50',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-[0.05em] border shadow-sm ${styles[status] || 'bg-slate-100'}`}>
      {labels[status] || status}
    </span>
  );
};

export default ClientList;
