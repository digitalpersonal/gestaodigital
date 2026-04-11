
import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete, onToggleStatus }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredExpenses = expenses.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'paid') return e.status === 'paid';
    if (filter === 'pending') return e.status === 'pending';
    return e.category === filter;
  });

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="p-4 md:p-6 border-b flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Fluxo de Despesas</h3>
          <p className="text-xs text-slate-500">Controle de saídas operacionais e custos fixos</p>
        </div>
        <select 
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="pending">Apenas Pendentes</option>
          <option value="paid">Apenas Pagas</option>
          {Object.values(ExpenseCategory).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800">{expense.description}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-lg text-slate-500">{expense.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onToggleStatus(expense.id)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border transition-all shadow-sm ${
                        expense.status === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {expense.status === 'paid' ? 'Paga ✓' : 'Pendente ⏳'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 transition-opacity">
                      <button 
                        onClick={() => onEdit(expense)} 
                        className="p-2 text-amber-600 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all shadow-sm"
                        title="Editar"
                      >
                        ✎
                      </button>
                      <button 
                        onClick={() => onDelete(expense.id)} 
                        className="p-2 text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all shadow-sm"
                        title="Excluir"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic">
                  Nenhuma despesa registrada nesta categoria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
