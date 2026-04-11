
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PaymentLog, ExternalSystem, Client, PaymentStatus, PaymentType, PaymentStatusConfig } from '../types';

interface StatusManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusConfigs: PaymentStatusConfig[];
  onUpdate: (configs: PaymentStatusConfig[]) => void;
}

const COLOR_OPTIONS = [
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-slate-100 text-slate-600 border-slate-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-orange-100 text-orange-700 border-orange-200',
];

const StatusManagementModal: React.FC<StatusManagementModalProps> = ({ isOpen, onClose, statusConfigs, onUpdate }) => {
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[4]);

  if (!isOpen) return null;

  const handleAddStatus = () => {
    if (!newLabel.trim()) return;
    const newConfig: PaymentStatusConfig = {
      id: `custom_${Math.random().toString(36).substr(2, 9)}`,
      label: newLabel,
      colorClass: newColor,
    };
    onUpdate([...statusConfigs, newConfig]);
    setNewLabel('');
  };

  const handleRemoveStatus = (id: string) => {
    onUpdate(statusConfigs.filter(c => c.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">Gerenciar Status</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Existentes</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {statusConfigs.map(config => (
                <div key={config.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${config.colorClass}`}>
                    {config.label}
                  </div>
                  {!config.isDefault && (
                    <button onClick={() => handleRemoveStatus(config.id)} className="text-rose-500 hover:text-rose-700 p-1">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adicionar Novo Status</h4>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Nome do status..." 
                className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none text-sm font-bold"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
              />
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setNewColor(c)}
                    className={`h-8 rounded-lg border transition-all ${c} ${newColor === c ? 'ring-2 ring-indigo-500 scale-105' : 'opacity-70 hover:opacity-100'}`}
                  >
                    {newColor === c && '✓'}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleAddStatus}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest"
              >
                Adicionar Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PaymentHistoryProps {
  payments: PaymentLog[];
  systems: ExternalSystem[];
  clients: Client[];
  statusConfigs: PaymentStatusConfig[];
  onUpdateStatusConfigs: (configs: PaymentStatusConfig[]) => void;
  initialSearchTerm?: string;
  onEditPayment?: (payment: PaymentLog) => void;
  onDeletePayment?: (id: string) => void;
  onQuickPay?: (id: string) => void;
  onNewManualPayment?: () => void;
}

const ITEMS_PER_PAGE = 10;

type ColumnId = 'type' | 'client' | 'date' | 'amount' | 'status' | 'actions';

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ 
  payments, 
  systems, 
  clients,
  statusConfigs,
  onUpdateStatusConfigs,
  initialSearchTerm = '',
  onEditPayment,
  onDeletePayment,
  onQuickPay,
  onNewManualPayment
}) => {
  const [filterSystem, setFilterSystem] = useState<string>('all');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(statusConfigs.map(c => c.id));
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isSystemDropdownOpen, setIsSystemDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isManageStatusOpen, setIsManageStatusOpen] = useState(false);
  
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(['type', 'client', 'date', 'amount', 'status', 'actions']);
  const [draggedColumn, setDraggedColumn] = useState<ColumnId | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);

  const systemDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterSystem, selectedStatuses, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (systemDropdownRef.current && !systemDropdownRef.current.contains(event.target as Node)) {
        setIsSystemDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSystem = filterSystem === 'all' || p.systemId === filterSystem;
      const matchesStatus = selectedStatuses.includes(p.status);
      
      const client = clients.find(c => c.id === p.clientId);
      const name = p.clientName || client?.name || '';
      const notes = p.notes || '';
      const searchStr = `${name} ${notes} ${p.clientId} ${p.id}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

      return matchesSystem && matchesStatus && matchesSearch;
    });
  }, [payments, filterSystem, selectedStatuses, searchTerm, clients]);

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPayments, currentPage]);

  const selectedSystem = systems.find(s => s.id === filterSystem);

  const toggleStatus = (statusId: string) => {
    setSelectedStatuses(prev => 
      prev.includes(statusId) 
        ? prev.filter(s => s !== statusId) 
        : [...prev, statusId]
    );
  };

  const toggleAllStatuses = () => {
    const allIds = statusConfigs.map(c => c.id);
    if (selectedStatuses.length === allIds.length) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(allIds);
    }
  };

  const isDueSoon = (dateStr: string) => {
    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(today.getDate() + 5);
    return dueDate <= fiveDaysFromNow && dueDate >= today;
  };

  const isOverdue = (dateStr: string) => {
    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const handleSendReminder = (payment: PaymentLog) => {
    const client = clients.find(c => c.id === payment.clientId);
    const system = systems.find(s => s.id === payment.systemId);
    
    if (!client || !client.phone) {
      alert("Este cliente não possui telefone cadastrado.");
      return;
    }

    const dueDate = new Date(payment.date).toLocaleDateString('pt-BR');
    const amountStr = payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const overdue = isOverdue(payment.date);
    
    let message = "";
    if (overdue) {
      message = `Olá ${client.name}! 👋 Notamos que seu pagamento do sistema *${system?.name}* no valor de *${amountStr}* venceu no dia *${dueDate}* e ainda consta como pendente em nosso sistema.\n\nCaso já tenha realizado o pagamento, por favor nos envie o comprovante. Se não, pedimos a gentileza de regularizar para evitar interrupções no serviço. Obrigado!`;
    } else {
      message = `Olá ${client.name}! 👋 Passando para lembrar que seu pagamento do sistema *${system?.name}* no valor de *${amountStr}* vence no dia *${dueDate}*.\n\nCaso já tenha pago, favor desconsiderar. Se precisar de algo, estamos à disposição!`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${client.phone}?text=${encodedMessage}`;
    
    window.open(waLink, '_blank');
  };

  // Logic for Drag and Drop Columns
  const handleDragStart = (id: ColumnId) => {
    setDraggedColumn(id);
  };

  const handleDragOver = (e: React.DragEvent, id: ColumnId) => {
    e.preventDefault();
    if (draggedColumn !== id) {
      setDragOverColumn(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: ColumnId) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetId) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedColumn);
      const targetIndex = newOrder.indexOf(targetId);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumn);
      
      setColumnOrder(newOrder);
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const renderHeader = (id: ColumnId) => {
    const isDragging = draggedColumn === id;
    const isOver = dragOverColumn === id;

    const commonClasses = `px-4 md:px-6 py-4 cursor-grab active:cursor-grabbing transition-all relative select-none ${isDragging ? 'opacity-30' : ''} ${isOver ? 'border-l-4 border-indigo-500 bg-indigo-50/50' : ''}`;

    switch (id) {
      case 'type':
        return <th key={id} draggable onDragStart={() => handleDragStart('type')} onDragOver={(e) => handleDragOver(e, 'type')} onDrop={(e) => handleDrop(e, 'type')} className={commonClasses}>Tipo</th>;
      case 'client':
        return <th key={id} draggable onDragStart={() => handleDragStart('client')} onDragOver={(e) => handleDragOver(e, 'client')} onDrop={(e) => handleDrop(e, 'client')} className={commonClasses}>Cliente</th>;
      case 'date':
        return <th key={id} draggable onDragStart={() => handleDragStart('date')} onDragOver={(e) => handleDragOver(e, 'date')} onDrop={(e) => handleDrop(e, 'date')} className={`${commonClasses} text-center`}>Data</th>;
      case 'amount':
        return <th key={id} draggable onDragStart={() => handleDragStart('amount')} onDragOver={(e) => handleDragOver(e, 'amount')} onDrop={(e) => handleDrop(e, 'amount')} className={`${commonClasses} text-right`}>Valor/Lucro</th>;
      case 'status':
        return <th key={id} draggable onDragStart={() => handleDragStart('status')} onDragOver={(e) => handleDragOver(e, 'status')} onDrop={(e) => handleDrop(e, 'status')} className={`${commonClasses} text-center`}>Status</th>;
      case 'actions':
        return <th key={id} draggable onDragStart={() => handleDragStart('actions')} onDragOver={(e) => handleDragOver(e, 'actions')} onDrop={(e) => handleDrop(e, 'actions')} className={`${commonClasses} text-right`}>Ações</th>;
    }
  };

  const renderCell = (id: ColumnId, p: PaymentLog) => {
    const client = clients.find(c => c.id === p.clientId);
    const system = systems.find(s => s.id === p.systemId);
    const dueSoon = p.status === 'pending' && isDueSoon(p.date);
    const overdue = p.status === 'pending' && isOverdue(p.date);
    const isProduct = p.type === PaymentType.PRODUCT;
    const profit = p.amount - (p.costAmount || 0);

    const isDragging = draggedColumn === id;
    const cellClass = `px-4 md:px-6 py-4 transition-all ${isDragging ? 'opacity-30 bg-slate-50/50' : ''}`;

    switch (id) {
      case 'type':
        return (
          <td key={id} className={cellClass}>
            {isProduct ? (
              <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-700 text-[8px] font-black uppercase rounded-md">Prod</span>
            ) : (
              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase rounded-md">Assin.</span>
            )}
          </td>
        );
      case 'client':
        return (
          <td key={id} className={cellClass}>
            <div className="flex items-center gap-2 md:gap-3 max-w-[150px] md:max-w-none">
              <div className={`w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold ${isProduct ? 'bg-cyan-100 text-cyan-600' : overdue ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                {overdue ? '⚠️' : (p.clientName || client?.name || 'A').charAt(0)}
              </div>
              <div className="truncate">
                <div className={`font-bold text-xs md:text-sm truncate ${overdue ? 'text-rose-700' : 'text-slate-800'}`}>
                  {p.clientName || client?.name || 'Avulso'}
                </div>
                <div className="text-[9px] text-slate-400 font-medium truncate">{system?.name}</div>
              </div>
            </div>
          </td>
        );
      case 'date':
        return (
          <td key={id} className={`${cellClass} text-[10px] md:text-sm text-slate-600 font-bold text-center`}>
            <div className="flex flex-col items-center">
              <span className={overdue ? 'text-rose-600 font-black' : dueSoon ? 'text-amber-600 font-black' : ''}>
                {new Date(p.date).toLocaleDateString('pt-BR')}
              </span>
              {overdue && (
                <div className="flex items-center gap-1 mt-0.5">
                   <span className="text-[8px] text-rose-600 font-black px-1.5 py-0.5 bg-rose-100 rounded-md animate-pulse uppercase">EXPIRADO</span>
                </div>
              )}
            </div>
          </td>
        );
      case 'amount':
        return (
          <td key={id} className={`${cellClass} text-right`}>
            <div className="flex flex-col items-end">
              <span className={`font-black text-xs md:text-sm ${overdue ? 'text-rose-800' : 'text-slate-900'}`}>R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              {isProduct && (
                <span className={`text-[8px] md:text-[9px] font-black italic ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  +{profit.toFixed(2)}
                </span>
              )}
            </div>
          </td>
        );
      case 'status':
        return (
          <td key={id} className={`${cellClass} text-center`}>
            <StatusBadge status={p.status} configs={statusConfigs} />
          </td>
        );
      case 'actions':
        return (
          <td key={id} className={`${cellClass} text-right`}>
            <div className="flex justify-end gap-1.5 md:gap-2">
              {!isProduct && p.status === 'pending' && (
                <button 
                  onClick={() => handleSendReminder(p)}
                  className={`p-2 rounded-xl transition-all shadow-sm border ${overdue ? 'bg-rose-600 text-white border-rose-700 shadow-rose-100 hover:scale-110' : dueSoon ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-100 hover:scale-110' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
                  title={overdue ? "Enviar Cobrança Crítica WhatsApp" : "Enviar Lembrete WhatsApp"}
                >
                  <span className="text-sm">{overdue ? '🚨' : '💬'}</span>
                </button>
              )}
              <button 
                onClick={() => onEditPayment?.(p)} 
                className="p-2 text-amber-600 bg-amber-50 rounded-xl shadow-sm border border-amber-100 hover:bg-amber-100 transition-all"
                title="Editar"
              >
                ✎
              </button>
            </div>
          </td>
        );
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <StatusManagementModal 
        isOpen={isManageStatusOpen} 
        onClose={() => setIsManageStatusOpen(false)} 
        statusConfigs={statusConfigs} 
        onUpdate={onUpdateStatusConfigs}
      />
      <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm space-y-4 md:space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          {/* System Selection */}
          <div className="w-full lg:w-1/4" ref={systemDropdownRef}>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Origem</label>
            <div className="relative">
              <div 
                onClick={() => setIsSystemDropdownOpen(!isSystemDropdownOpen)}
                className={`flex items-center justify-between gap-3 bg-slate-50 border ${isSystemDropdownOpen ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200'} px-4 py-3 rounded-xl cursor-pointer transition-all`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-lg">{selectedSystem?.icon || '🌐'}</span>
                  <span className={`font-bold text-xs md:text-sm truncate ${selectedSystem ? 'text-slate-800' : 'text-slate-400'}`}>
                    {selectedSystem ? selectedSystem.name : 'Todas as Origens'}
                  </span>
                </div>
                <span className={`text-[10px] text-slate-400 transition-transform ${isSystemDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
              {isSystemDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-48 overflow-y-auto">
                  <div 
                    onClick={() => {setFilterSystem('all'); setIsSystemDropdownOpen(false);}}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-600"
                  >
                    🌐 Todas as Origens
                  </div>
                  {systems.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => {setFilterSystem(s.id); setIsSystemDropdownOpen(false);}}
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-600 flex items-center gap-2"
                    >
                      <span>{s.icon}</span> {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Multi-selection */}
          <div className="w-full lg:w-1/4" ref={statusDropdownRef}>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Status</label>
              <button 
                onClick={() => setIsManageStatusOpen(true)}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
              >
                ⚙️ Config
              </button>
            </div>
            <div className="relative">
              <div 
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`flex items-center justify-between gap-3 bg-slate-50 border ${isStatusDropdownOpen ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200'} px-4 py-3 rounded-xl cursor-pointer transition-all`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-lg">📊</span>
                  <span className="font-bold text-xs md:text-sm truncate text-slate-800">
                    {selectedStatuses.length === statusConfigs.length 
                      ? 'Todos os Status' 
                      : `${selectedStatuses.length} selecionados`}
                  </span>
                </div>
                <span className={`text-[10px] text-slate-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-2">
                  <div 
                    onClick={toggleAllStatuses}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-800 flex items-center gap-3 border-b border-slate-50 mb-1"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedStatuses.length === statusConfigs.length ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                      {selectedStatuses.length === statusConfigs.length && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    Selecionar Todos
                  </div>
                  {statusConfigs.map(config => (
                    <div 
                      key={config.id}
                      onClick={() => toggleStatus(config.id)}
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-600 flex items-center gap-3"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedStatuses.includes(config.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                        {selectedStatuses.includes(config.id) && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] ${config.colorClass}`}>
                        {config.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-2">
             <div className="relative flex-1">
               <input
                  type="text"
                  placeholder="Pesquisar por cliente..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-4 top-3.5 opacity-30 text-xs md:text-sm">🔍</span>
             </div>
             <button 
                onClick={onNewManualPayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
             >
               <span>💸</span> <span className="hidden sm:inline">Recebimento Manual</span><span className="sm:hidden">Manual</span>
             </button>
          </div>
        </div>
        <div className="flex justify-between items-center px-1">
           <div className="flex items-center gap-4">
             <p className="text-[9px] font-black text-slate-400 italic uppercase tracking-widest">
               Dica: Arraste os cabeçalhos para reordenar
             </p>
             <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
               <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Alertas de Atraso Ativos</span>
             </div>
           </div>
           {searchTerm && (
             <button onClick={() => setSearchTerm('')} className="text-[9px] font-black text-indigo-500 uppercase">Limpar Busca</button>
           )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[700px] md:min-w-full">
            <thead className="bg-slate-50 text-slate-500 text-[9px] md:text-[10px] uppercase font-black tracking-widest border-b">
              <tr>
                {columnOrder.map(renderHeader)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPayments.length > 0 ? paginatedPayments.map((p) => {
                const dueSoon = p.status === 'pending' && isDueSoon(p.date);
                const overdue = p.status === 'pending' && isOverdue(p.date);
                return (
                  <tr 
                    key={p.id} 
                    className={`hover:bg-slate-50 transition-all group border-l-4 ${
                      overdue 
                      ? 'bg-gradient-to-r from-rose-50/70 to-white border-l-rose-600 shadow-inner' 
                      : dueSoon 
                      ? 'bg-amber-50/30 border-l-amber-400' 
                      : 'border-l-transparent'
                    }`}
                  >
                    {columnOrder.map(colId => renderCell(colId, p))}
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={columnOrder.length} className="px-6 py-20 text-center text-slate-400 font-bold italic">Nenhuma transação encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 bg-slate-50 border-t flex items-center justify-between gap-4">
           <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-all"
           >
            Anterior
           </button>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pág {currentPage} / {totalPages || 1}</span>
           <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-all"
           >
            Próxima
           </button>
        </div>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
  configs: PaymentStatusConfig[];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, configs }) => {
  const config = configs.find(c => c.id === status) || { 
    label: status, 
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200' 
  };

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-tight border ${config.colorClass}`}>
      {config.label}
    </span>
  );
};

export default PaymentHistory;
