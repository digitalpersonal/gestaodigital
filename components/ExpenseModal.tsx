
import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, ExternalSystem } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  editingExpense?: Expense | null;
  systems?: ExternalSystem[];
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave, editingExpense, systems = [] }) => {
  const [formData, setFormData] = useState<Partial<Expense>>({
    description: '',
    category: ExpenseCategory.OTHERS,
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    systemId: ''
  });

  useEffect(() => {
    if (editingExpense) {
      setFormData(editingExpense);
    } else {
      setFormData({
        description: '',
        category: ExpenseCategory.OTHERS,
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: '',
        systemId: ''
      });
    }
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: editingExpense?.id || `e_${Math.random().toString(36).substr(2, 9)}`,
    } as Expense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">
            {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Descrição do Gasto</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Servidor GuaraFood, Internet Escritório..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-medium"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Vincular a Empresa/Sistema</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold"
                value={formData.systemId || ''}
                onChange={e => setFormData({...formData, systemId: e.target.value})}
              >
                <option value="">Custo Geral (Todos)</option>
                {systems.map(sys => (
                  <option key={sys.id} value={sys.id}>{sys.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Categoria</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}
              >
                {Object.values(ExpenseCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Valor (R$)</label>
              <input 
                required
                type="number" 
                step="0.01"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-slate-800"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Vencimento</label>
              <input 
                required
                type="date" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, status: 'pending'})}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.status === 'pending' ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-100' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                Pendente ⏳
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, status: 'paid'})}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.status === 'paid' ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                Pago ✓
              </button>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-400 uppercase text-[10px] tracking-widest">Cancelar</button>
            <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100">Salvar Registro</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
