
import React, { useState } from 'react';
import { ExternalSystem, Client, PaymentLog, SubscriptionStatus, PaymentStatus, Expense, HistoryEntry, PaymentStatusConfig } from '../types';
import ClientList from './ClientList';
import PaymentHistory from './PaymentHistory';
import ExpenseList from './ExpenseList';

interface SystemDetailViewProps {
  system: ExternalSystem;
  clients: Client[];
  payments: PaymentLog[];
  expenses: Expense[];
  allSystems: ExternalSystem[];
  statusConfigs: PaymentStatusConfig[];
  onBack: () => void;
  onEditSystem: (system: ExternalSystem) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onEditPayment: (payment: PaymentLog) => void;
  onDeletePayment: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onToggleExpense: (id: string) => void;
  onNewClient: () => void;
  onNewPayment: () => void;
}

const SystemDetailView: React.FC<SystemDetailViewProps> = ({ 
  system, 
  clients, 
  payments, 
  expenses,
  allSystems,
  statusConfigs,
  onBack, 
  onEditSystem,
  onEditClient,
  onDeleteClient,
  onEditPayment,
  onDeletePayment,
  onEditExpense,
  onDeleteExpense,
  onToggleExpense,
  onNewClient,
  onNewPayment
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'finance' | 'expenses' | 'audit'>('users');
  
  const systemClients = clients.filter(c => c.systemId === system.id);
  const systemPayments = payments.filter(p => p.systemId === system.id);
  const systemExpenses = expenses.filter(e => e.systemId === system.id);
  
  // Consolidar todos os logs de auditoria dos clientes deste sistema
  const auditLogs = systemClients.flatMap(client => 
    (client.history || []).map(entry => ({ ...entry, clientName: client.name }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const mrr = systemClients
    .filter(c => c.status === SubscriptionStatus.ACTIVE)
    .reduce((acc, curr) => acc + (curr.amount - (curr.discount || 0)), 0);

  const totalReceived = systemPayments
    .filter(p => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalCosts = systemExpenses
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netResult = totalReceived - totalCosts;

  const fieldLabels: Record<string, string> = {
    status: 'Status',
    planName: 'Plano',
    amount: 'Valor Base',
    discount: 'Desconto'
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
      {/* Header Estilo Corporate */}
      <div className={`${system.color} p-6 md:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden transition-all`}>
        <div className="absolute right-0 top-0 opacity-10 text-[240px] leading-none select-none pointer-events-none transform translate-x-16 -translate-y-16 rotate-12">
          {system.icon}
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <button 
              onClick={onBack}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar aos Sistemas
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={onNewClient}
                className="px-5 py-2.5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all"
              >
                + Novo Cliente
              </button>
              <button 
                onClick={() => onEditSystem(system)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 backdrop-blur-md transition-all"
              >
                ⚙️
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 md:w-28 md:h-28 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-5xl md:text-6xl shadow-2xl border border-white/30">
                {system.icon}
              </div>
              <div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-1">{system.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Empresa Independente</span>
                  <span className="text-white/70 text-xs font-bold uppercase tracking-widest">ID: {system.id}</span>
                </div>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 min-w-[200px]">
              <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-2">Resultado Líquido</p>
              <p className={`text-3xl font-black ${netResult >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                R$ {netResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <MetricCard label="MRR da Empresa" value={`R$ ${mrr.toLocaleString('pt-BR')}`} />
            <MetricCard label="Base de Usuários" value={systemClients.length.toString()} />
            <MetricCard label="Total Faturado" value={`R$ ${totalReceived.toLocaleString('pt-BR')}`} />
            <MetricCard label="Custos Dedicados" value={`R$ ${totalCosts.toLocaleString('pt-BR')}`} color="text-rose-200" />
          </div>
        </div>
      </div>

      {/* Tabs de Navegação Interna da "Empresa" */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border rounded-3xl w-fit shadow-sm">
        <SubTabButton active={activeSubTab === 'users'} onClick={() => setActiveSubTab('users')} icon="👥" label="Usuários" />
        <SubTabButton active={activeSubTab === 'finance'} onClick={() => setActiveSubTab('finance')} icon="💰" label="Receitas" />
        <SubTabButton active={activeSubTab === 'expenses'} onClick={() => setActiveSubTab('expenses')} icon="💸" label="Custos" />
        <SubTabButton active={activeSubTab === 'audit'} onClick={() => setActiveSubTab('audit')} icon="📜" label="Auditoria" />
      </div>

      <div className="transition-all duration-500">
        {activeSubTab === 'users' && (
          <ClientList clients={systemClients} systems={allSystems} initialFilter={system.id} onManageClient={onEditClient} onDeleteClient={onDeleteClient} />
        )}
        {activeSubTab === 'finance' && (
          <PaymentHistory payments={systemPayments} systems={allSystems} clients={systemClients} statusConfigs={statusConfigs} onUpdateStatusConfigs={() => {}} onEditPayment={onEditPayment} onDeletePayment={onDeletePayment} onNewManualPayment={onNewPayment} />
        )}
        {activeSubTab === 'expenses' && (
          <ExpenseList expenses={systemExpenses} onEdit={onEditExpense} onDelete={onDeleteExpense} onToggleStatus={onToggleExpense} />
        )}
        {activeSubTab === 'audit' && (
          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-black text-slate-800">Trilha de Auditoria da Empresa</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Histórico completo de alterações contratuais</p>
            </div>
            <div className="p-6 space-y-4">
              {auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log: any) => (
                    <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4 group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center text-xl shadow-sm">👤</div>
                         <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{log.clientName}</p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">Alteração de {fieldLabels[log.field]}</p>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-[9px] bg-white px-2 py-0.5 rounded border text-slate-400 line-through">{log.oldValue}</span>
                               <span className="text-[10px]">➜</span>
                               <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-black">{log.newValue}</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right border-t md:border-t-0 pt-3 md:pt-0">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.date).toLocaleString('pt-BR')}</p>
                         <p className="text-[10px] font-bold text-slate-600 mt-1">Por: {log.adminName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center opacity-30 italic">
                  <span className="text-4xl mb-4">🔍</span>
                  <p className="text-sm font-bold uppercase tracking-widest">Nenhum log de auditoria encontrado para este sistema.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = "text-white" }) => (
  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10 hover:bg-white/20 transition-all group">
    <p className="text-[9px] font-black uppercase text-white/50 tracking-[0.2em] mb-1 group-hover:text-white/80 transition-colors">{label}</p>
    <p className={`text-xl font-black ${color}`}>{value}</p>
  </div>
);

const SubTabButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all ${
      active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    <span>{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default SystemDetailView;
