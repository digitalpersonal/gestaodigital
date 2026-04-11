import React, { useState, useMemo } from 'react';
import { PaymentLog, Expense, ExternalSystem, PaymentStatus, PaymentType } from '../types';

interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  subLabel: string;
  textColor?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  label, value, color, bgColor, subLabel, textColor = "text-slate-800" 
}) => {
  const displayValue = value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const labelColor = textColor === 'text-white' ? 'opacity-60 text-white' : 'text-slate-400';
  const subLabelColor = textColor === 'text-white' ? 'opacity-40 text-white' : 'text-slate-400';

  return (
    <div className={`${bgColor} p-8 rounded-[2.5rem] border shadow-sm group hover:scale-[1.02] transition-all`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${labelColor}`}>
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-black ${color}`}>
          R$ {displayValue}
        </span>
      </div>
      <p className={`text-[10px] font-bold mt-4 italic ${subLabelColor}`}>
        {subLabel}
      </p>
    </div>
  );
};

type Period = 'today' | 'week' | 'month' | 'custom';

interface FinancialClosingProps {
  payments: PaymentLog[];
  expenses: Expense[];
  systems: ExternalSystem[];
}

const FinancialClosing: React.FC<FinancialClosingProps> = ({ payments = [], expenses = [], systems = [] }) => {
  const [period, setPeriod] = useState<Period>('month');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredData = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (period === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'custom') {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    const periodPayments = payments.filter(p => {
      const d = new Date(p.date);
      return d >= start && d <= end;
    });

    const periodExpenses = expenses.filter(e => {
      const d = new Date(e.dueDate);
      return d >= start && d <= end;
    });

    const rev = periodPayments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((acc, p) => acc + p.amount, 0);

    const exp = periodExpenses
      .filter(e => e.status === 'paid')
      .reduce((acc, e) => acc + e.amount, 0);

    const cos = periodPayments
      .filter(p => p.status === PaymentStatus.PAID && p.type === PaymentType.PRODUCT)
      .reduce((acc, p) => acc + (p.costAmount || 0), 0);

    return {
      payments: periodPayments,
      expenses: periodExpenses,
      revenue: rev,
      paidExpenses: exp,
      costOfSales: cos,
      profit: rev - exp - cos,
      start: start,
      end: end
    };
  }, [period, startDate, endDate, payments, expenses]);

  const systemsSummary = systems.map(sys => {
    const sysRev = filteredData.payments
      .filter(p => p.systemId === sys.id && p.status === PaymentStatus.PAID)
      .reduce((acc, p) => acc + p.amount, 0);
    
    const sysExp = filteredData.expenses
      .filter(e => e.systemId === sys.id && e.status === 'paid')
      .reduce((acc, e) => acc + e.amount, 0);

    const sysCos = filteredData.payments
      .filter(p => p.systemId === sys.id && p.status === PaymentStatus.PAID && p.type === PaymentType.PRODUCT)
      .reduce((acc, p) => acc + (p.costAmount || 0), 0);

    const sysProfit = sysRev - sysExp - sysCos;

    return {
      ...sys,
      revenue: sysRev,
      expense: sysExp,
      costOfSales: sysCos,
      profit: sysProfit
    };
  }).filter(s => s.revenue > 0 || s.expense > 0);

  const periods: Period[] = ['today', 'week', 'month', 'custom'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-full lg:w-auto">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                period === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-indigo-600'
              }`}
            >
              {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Período'}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-3 w-full lg:w-auto animate-in slide-in-from-right-4 duration-300">
            <input type="date" className="px-4 py-2 bg-slate-50 border rounded-xl text-xs font-bold" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="text-slate-300">➜</span>
            <input type="date" className="px-4 py-2 bg-slate-50 border rounded-xl text-xs font-bold" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        )}

        <div className="text-center lg:text-right w-full lg:w-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativo</p>
          <p className="text-xs font-bold text-slate-800 italic">
            {filteredData.start.toLocaleDateString('pt-BR')} até {filteredData.end.toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          label="Entradas" 
          value={filteredData.revenue} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
          subLabel={`${filteredData.payments.filter(p => p.status === PaymentStatus.PAID).length} pagos`}
        />
        <SummaryCard 
          label="Saídas" 
          value={filteredData.paidExpenses + filteredData.costOfSales} 
          color="text-rose-600" 
          bgColor="bg-rose-50" 
          subLabel={`${filteredData.expenses.filter(e => e.status === 'paid').length} liquidadas`}
        />
        <SummaryCard 
          label="Resultado" 
          value={filteredData.profit} 
          color={filteredData.profit >= 0 ? "text-indigo-600" : "text-rose-600"} 
          bgColor="bg-slate-900" 
          textColor="text-white"
          subLabel={`Margem de ${filteredData.revenue > 0 ? ((filteredData.profit / filteredData.revenue) * 100).toFixed(1) : 0}%`}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="p-8 border-b">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Fechamento por Unidade</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
              <tr>
                <th className="px-8 py-5">Unidade</th>
                <th className="px-8 py-5 text-right">Faturamento</th>
                <th className="px-8 py-5 text-right">Custos</th>
                <th className="px-8 py-5 text-right">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {systemsSummary.map((sys) => (
                <tr key={sys.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{sys.icon}</span>
                      <span className="text-sm font-black text-slate-800">{sys.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-bold text-slate-600">R$ {sys.revenue.toLocaleString('pt-BR')}</td>
                  <td className="px-8 py-6 text-right font-bold text-rose-500">- R$ {(sys.expense + sys.costOfSales).toLocaleString('pt-BR')}</td>
                  <td className="px-8 py-6 text-right font-black text-indigo-600">R$ {sys.profit.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialClosing;