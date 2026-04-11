
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Client, ExternalSystem, SubscriptionStatus, HistoryEntry, BillingCycle } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  systems: ExternalSystem[];
  editingClient?: Client | null;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, systems, editingClient }) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    systemId: systems[0]?.id || '',
    amount: 0,
    discount: 0,
    planName: '',
    billingCycle: BillingCycle.MONTHLY,
    nextBillingDate: new Date().toISOString().split('T')[0],
    status: SubscriptionStatus.ACTIVE,
    currency: 'BRL',
    history: []
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingClient) {
      setFormData(editingClient);
      if (editingClient.nextBillingDate) {
        setViewDate(new Date(editingClient.nextBillingDate + 'T12:00:00'));
      }
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        systemId: systems[0]?.id || '',
        amount: 0,
        discount: 0,
        planName: '',
        nextBillingDate: new Date().toISOString().split('T')[0],
        status: SubscriptionStatus.ACTIVE,
        currency: 'BRL',
        history: []
      });
      setViewDate(new Date());
    }
  }, [editingClient, systems, isOpen]);

  // Fechar calendário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Dias vazios do mês anterior
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [viewDate]);

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setFormData({ ...formData, nextBillingDate: formattedDate });
    setShowCalendar(false);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newHistory: HistoryEntry[] = [...(formData.history || [])];
    const now = new Date().toISOString();
    const admin = "Admin Global";

    if (editingClient) {
      if (editingClient.status !== formData.status) {
        newHistory.push({
          id: `h_${Math.random().toString(36).substr(2, 9)}`,
          date: now,
          adminName: admin,
          field: 'status',
          oldValue: editingClient.status,
          newValue: formData.status!
        });
      }
      if (editingClient.amount !== formData.amount) {
        newHistory.push({
          id: `h_${Math.random().toString(36).substr(2, 9)}`,
          date: now,
          adminName: admin,
          field: 'amount',
          oldValue: editingClient.amount,
          newValue: formData.amount!
        });
      }
      if (editingClient.billingCycle !== formData.billingCycle) {
        newHistory.push({
          id: `h_${Math.random().toString(36).substr(2, 9)}`,
          date: now,
          adminName: admin,
          field: 'billingCycle',
          oldValue: editingClient.billingCycle,
          newValue: formData.billingCycle!
        });
      }
    }

    onSave({
      ...formData,
      id: editingClient?.id || `c_${Math.random().toString(36).substr(2, 9)}`,
      history: newHistory
    } as Client);
    onClose();
  };

  if (!isOpen) return null;

  const finalAmount = Math.max(0, (formData.amount || 0) - (formData.discount || 0));
  const selectedDate = formData.nextBillingDate ? new Date(formData.nextBillingDate + 'T12:00:00') : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 h-full max-h-[95vh] sm:max-h-[85vh] flex flex-col">
        
        {/* Header - Super Compacto */}
        <div className="px-5 py-3 sm:px-8 sm:py-5 border-b flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-800 leading-tight">
              {editingClient ? 'Gestão de Cliente' : 'Novo Cliente'}
            </h3>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {formData.id || 'Novo'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all">✕</button>
        </div>
        
        {/* Corpo com Scroll Independente */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="flex flex-col md:flex-row min-h-full">
            
            {/* Formulário Principal */}
            <div className="flex-1 p-5 sm:p-8 space-y-6">
              <form id="client-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Nome do Cliente</label>
                  <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-semibold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Sistema Destino</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold appearance-none cursor-pointer" value={formData.systemId} onChange={e => setFormData({...formData, systemId: e.target.value})}>
                    {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Status Atual</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold appearance-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as SubscriptionStatus})}>
                    <option value={SubscriptionStatus.ACTIVE}>Ativo</option>
                    <option value={SubscriptionStatus.PAUSED}>Pausado</option>
                    <option value={SubscriptionStatus.CANCELLED}>Cancelado</option>
                    <option value={SubscriptionStatus.TRIAL}>Trial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Ciclo de Faturamento</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold appearance-none cursor-pointer" value={formData.billingCycle} onChange={e => setFormData({...formData, billingCycle: e.target.value as BillingCycle})}>
                    <option value={BillingCycle.WEEKLY}>Semanal</option>
                    <option value={BillingCycle.MONTHLY}>Mensal</option>
                    <option value={BillingCycle.ANNUAL}>Anual</option>
                    <option value={BillingCycle.ONETIME}>Pagamento Único</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Nome do Plano / Modalidade</label>
                  <input required type="text" placeholder="Ex: Mensal Gold" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold" value={formData.planName} onChange={e => setFormData({...formData, planName: e.target.value})} />
                </div>

                {/* Seletor de Data Interativo */}
                <div className="relative sm:col-span-2 md:col-span-1" ref={calendarRef}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Próximo Vencimento</label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-700 hover:border-indigo-300 transition-all"
                  >
                    <span>{selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Selecionar data'}</span>
                    <span className="text-indigo-400">📅</span>
                  </button>

                  {showCalendar && (
                    <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in duration-200">
                      <div className="flex items-center justify-between mb-4 px-1">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">❮</button>
                        <div className="text-xs font-black text-slate-800 uppercase tracking-widest">
                          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </div>
                        <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">❯</button>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {WEEKDAYS.map(day => (
                          <div key={day} className="text-[10px] font-black text-slate-300 text-center py-1">{day}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((date, idx) => {
                          if (!date) return <div key={`empty-${idx}`} className="h-8" />;
                          
                          const isSelected = selectedDate && 
                            date.getDate() === selectedDate.getDate() && 
                            date.getMonth() === selectedDate.getMonth() && 
                            date.getFullYear() === selectedDate.getFullYear();
                          
                          const isToday = new Date().toDateString() === date.toDateString();

                          return (
                            <button
                              key={date.toISOString()}
                              type="button"
                              onClick={() => handleDateSelect(date)}
                              className={`
                                h-8 w-full flex items-center justify-center rounded-lg text-[11px] font-black transition-all
                                ${isSelected 
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110' 
                                  : isToday 
                                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}
                              `}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-3 border-t flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleDateSelect(new Date())}
                          className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                        >
                          Ir para hoje
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Valor Bruto (R$)</label>
                  <input required type="number" step="0.01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-black" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} />
                </div>

                <div className="relative sm:col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-rose-400 uppercase mb-1 ml-1">Desconto (R$)</label>
                  <input type="number" step="0.01" className="w-full px-4 py-2.5 bg-rose-50/30 border border-rose-100 rounded-xl outline-none text-sm font-black text-rose-600" value={formData.discount} onChange={e => setFormData({...formData, discount: parseFloat(e.target.value) || 0})} />
                </div>

                {/* Card de Faturamento Líquido */}
                <div className="sm:col-span-2 mt-2 p-4 bg-slate-900 rounded-2xl flex justify-between items-center shadow-lg shadow-indigo-100/20">
                   <div>
                     <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">Resultado Final</p>
                     <p className="text-[10px] text-white/50 font-bold uppercase">Líquido Creditado</p>
                   </div>
                   <div className="text-right">
                     <span className="text-2xl font-black text-white">R$ {finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                   </div>
                </div>
              </form>
            </div>

            {/* Auditoria - Lateral no desktop, final no mobile */}
            <div className="w-full md:w-64 bg-slate-50 border-l border-slate-100 shrink-0">
              <div className="p-4 border-b flex items-center justify-between bg-slate-100/50">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Histórico</h4>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{formData.history?.length || 0}</span>
              </div>
              <div className="p-6 space-y-5">
                {formData.history && formData.history.length > 0 ? (
                  formData.history.slice().reverse().map((entry) => (
                    <div key={entry.id} className="relative pl-4 border-l-2 border-slate-200 py-1">
                      <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-300"></div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">{new Date(entry.date).toLocaleDateString('pt-BR')}</p>
                      <p className="text-[10px] font-bold text-slate-700 mt-0.5">{entry.field} alterado</p>
                      <div className="mt-2 text-[9px] flex items-center gap-1 font-bold">
                        <span className="text-slate-400 line-through">{entry.oldValue}</span>
                        <span className="text-slate-300">➜</span>
                        <span className="text-emerald-600">{entry.newValue}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center opacity-30 flex flex-col items-center">
                    <span className="text-2xl mb-2">📜</span>
                    <p className="text-[9px] font-black uppercase tracking-widest leading-tight">Sem histórico<br/>de alterações</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="px-5 py-4 sm:px-8 sm:py-6 border-t bg-white flex flex-col sm:flex-row gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 sm:flex-none px-8 py-3.5 border border-slate-200 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="client-form"
            className="flex-1 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase text-[10px] tracking-widest active:scale-95"
          >
            {editingClient ? 'Salvar Alterações' : 'Confirmar Cadastro'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClientModal;
