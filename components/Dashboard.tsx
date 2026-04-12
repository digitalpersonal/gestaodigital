import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Client, PaymentLog, ExternalSystem, SubscriptionStatus, Expense, PaymentStatus, PaymentType, BillingCycle } from '../types';

interface DashboardProps {
  clients: Client[];
  payments: PaymentLog[];
  systems: ExternalSystem[];
  expenses: Expense[];
  onNavigate: (tab: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">{label}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-8">
            <span className="text-slate-400">Receita Bruta:</span>
            <span className="font-bold">R$ {data.revenue.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-slate-400">Custos Totais:</span>
            <span className="font-bold text-rose-400">- R$ {data.costs.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-px bg-white/10 my-2"></div>
          <div className="flex justify-between gap-8 text-sm">
            <span className="font-black text-white">Lucro Líquido:</span>
            <span className={`font-black ${data.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {data.profit.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between gap-8 text-[10px] pt-1">
            <span className="text-slate-500 font-bold uppercase">Eficiência:</span>
            <span className="text-indigo-300 font-black">{data.margin}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ clients, payments, systems, expenses, onNavigate }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalMRR = clients
    .filter(c => c.status === SubscriptionStatus.ACTIVE)
    .reduce((acc, curr) => {
      const netAmount = Math.max(0, curr.amount - (curr.discount || 0));
      if (curr.billingCycle === BillingCycle.ANNUAL) return acc + (netAmount / 12);
      if (curr.billingCycle === BillingCycle.WEEKLY) return acc + (netAmount * 4.33); // Média de semanas no mês
      if (curr.billingCycle === BillingCycle.ONETIME) return acc; // Pagamento único não entra no MRR
      return acc + netAmount; // Mensal (padrão)
    }, 0);
  
  const globalExpenses = expenses
    .filter(e => {
      const d = new Date(e.dueDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, e) => acc + e.amount, 0);

  const globalPayments = payments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && p.status === PaymentStatus.PAID;
  });

  const totalRevenue = globalPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalProductCosts = globalPayments
    .filter(p => p.type === PaymentType.PRODUCT)
    .reduce((acc, p) => acc + (p.costAmount || 0), 0);

  const globalNetProfit = totalRevenue - globalExpenses - totalProductCosts;

  const performanceBySystem = systems.map(sys => {
    const sysPayments = globalPayments.filter(p => p.systemId === sys.id);
    const sysExpenses = expenses.filter(e => {
      const d = new Date(e.dueDate);
      return e.systemId === sys.id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const revenue = sysPayments.reduce((acc, p) => acc + p.amount, 0);
    const costOfSales = sysPayments.filter(p => p.type === PaymentType.PRODUCT).reduce((acc, p) => acc + (p.costAmount || 0), 0);
    const operatingExpenses = sysExpenses.reduce((acc, e) => acc + e.amount, 0);
    
    const totalCosts = costOfSales + operatingExpenses;
    const profit = revenue - totalCosts;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      name: sys.name,
      icon: sys.icon,
      revenue,
      costs: totalCosts,
      profit,
      margin: margin.toFixed(1)
    };
  }).sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
             <span className="px-3 py-1 bg-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">Centro de Comando Financeiro</span>
             <h2 className="text-3xl md:text-5xl font-black mt-3 tracking-tighter">Fluxo Unificado</h2>
             <p className="text-slate-400 mt-2 font-medium">Gestão consolidada de {systems.length} unidades de negócio</p>
          </div>
          <div className="flex gap-4 md:gap-12">
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Resultado Líquido</p>
                <p className={`text-2xl md:text-4xl font-black ${globalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  R$ {globalNetProfit.toLocaleString('pt-BR')}
                </p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Previsto (MRR)</p>
                <p className="text-2xl md:text-4xl font-black text-white">
                  R$ {totalMRR.toLocaleString('pt-BR')}
                </p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Performance por Unidade</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Comparativo direto: Receita vs. Lucro Líquido</p>
            </div>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-slate-100 border"></div> Receita</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-indigo-600"></div> Lucro Líquido</span>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceBySystem} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(val) => `R$ ${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" fill="#f1f5f9" radius={[12, 12, 0, 0]} barSize={48} />
                <Bar dataKey="profit" radius={[12, 12, 0, 0]} barSize={48}>
                   {performanceBySystem.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#6366f1' : '#f43f5e'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Ranking de Eficiência</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Sistemas com maior margem real</p>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {performanceBySystem.map((sys, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl shadow-inner border border-slate-100 group-hover:scale-110 transition-transform">
                    {sys.icon}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 truncate max-w-[120px]">{sys.name}</p>
                    <p className="text-[10px] font-bold text-emerald-500 mt-0.5">R$ {sys.profit.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${parseFloat(sys.margin) > 50 ? 'bg-emerald-100 text-emerald-700' : parseFloat(sys.margin) > 20 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    {sys.margin}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
             <div className="bg-indigo-600 p-4 rounded-2xl text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 opacity-80 mb-1">Líder do Mês</p>
                <p className="text-lg font-black">{performanceBySystem[0]?.name || '---'}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 group hover:bg-rose-100 transition-colors cursor-pointer" onClick={() => onNavigate('payments')}>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">⚠️</div>
          <div>
            <h4 className="text-rose-900 font-black text-lg">Central de Inadimplência</h4>
            <p className="text-rose-700/70 text-sm font-medium">Existem {payments.filter(p => p.status === PaymentStatus.PENDING).length} pendências que afetam o lucro unificado.</p>
          </div>
          <div className="ml-auto text-rose-900 font-black text-2xl group-hover:translate-x-2 transition-transform">➜</div>
        </div>

        <div className="bg-cyan-50 border border-cyan-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 group hover:bg-cyan-100 transition-colors cursor-pointer" onClick={() => onNavigate('systems')}>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">🎨</div>
          <div>
            <h4 className="text-cyan-900 font-black text-lg">Operação de Produtos</h4>
            <p className="text-cyan-700/70 text-sm font-medium">Lucro de R$ {performanceBySystem.find(s => s.name.includes('Gráf'))?.profit.toLocaleString('pt-BR') || '0,00'} registrado este mês.</p>
          </div>
          <div className="ml-auto text-cyan-900 font-black text-2xl group-hover:translate-x-2 transition-transform">➜</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;