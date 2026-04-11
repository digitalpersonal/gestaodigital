
import React, { useState } from 'react';
import { PaymentLog, PaymentStatus, PaymentType, Client } from '../types';

interface ProductSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: PaymentLog) => void;
  clients: Client[];
}

const ProductSaleModal: React.FC<ProductSaleModalProps> = ({ isOpen, onClose, onSave, clients }) => {
  const [formData, setFormData] = useState<Partial<PaymentLog>>({
    clientId: '',
    clientName: '',
    amount: 0,
    costAmount: 0,
    date: new Date().toISOString().split('T')[0],
    status: PaymentStatus.PAID,
    notes: '',
    type: PaymentType.PRODUCT,
    systemId: 'sys_graphic'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: `sale_${Math.random().toString(36).substr(2, 9)}`,
    } as PaymentLog);
    onClose();
  };

  const profit = (formData.amount || 0) - (formData.costAmount || 0);
  const margin = formData.amount ? (profit / formData.amount) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-cyan-50">
          <div>
            <h3 className="text-xl font-bold text-cyan-900">Nova Venda Gráfica</h3>
            <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">Cálculo de Lucro por Unidade</p>
          </div>
          <button onClick={onClose} className="text-cyan-400 hover:text-cyan-600 p-2 rounded-full hover:bg-cyan-100 transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Vender para Cliente Existente?</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-100"
                value={formData.clientId}
                onChange={e => {
                  const client = clients.find(c => c.id === e.target.value);
                  setFormData({...formData, clientId: e.target.value, clientName: client?.name});
                }}
              >
                <option value="">-- Selecione (Opcional) --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {!formData.clientId && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nome do Cliente (Avulso)</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-100"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Descrição do Produto/Serviço</label>
              <input 
                required
                type="text" 
                placeholder="Ex: 500 Cartões de Visita"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-100"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-rose-500 uppercase mb-1 ml-1">Preço de Custo (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 font-bold text-rose-400">R$</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2.5 bg-rose-50/50 border border-rose-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-100 font-bold text-rose-700"
                    value={formData.costAmount}
                    onChange={e => setFormData({...formData, costAmount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-500 uppercase mb-1 ml-1">Preço de Venda (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 font-bold text-emerald-400">R$</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-100 font-bold text-emerald-700"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl flex justify-between items-center text-white">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Lucro Estimado</p>
                <p className={`text-xl font-black ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400">Margem</p>
                <p className="text-xl font-black text-white">{margin.toFixed(1)}%</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Data do Pedido</label>
              <input 
                required
                type="date" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-100"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-100 transition-all active:scale-95"
            >
              Registrar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductSaleModal;
