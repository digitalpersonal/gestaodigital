
import React, { useState, useEffect } from 'react';
import { PaymentLog, Client, ExternalSystem, PaymentStatusConfig } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: PaymentLog) => void;
  clients: Client[];
  systems: ExternalSystem[];
  editingPayment?: PaymentLog | null;
  statusConfigs: PaymentStatusConfig[];
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  clients, 
  systems, 
  editingPayment,
  statusConfigs
}) => {
  const [formData, setFormData] = useState<Partial<PaymentLog>>({
    clientId: '',
    systemId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'paid',
    notes: ''
  });

  useEffect(() => {
    if (editingPayment) {
      setFormData(editingPayment);
    } else {
      setFormData({
        clientId: clients[0]?.id || '',
        systemId: systems[0]?.id || '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'paid',
        notes: ''
      });
    }
  }, [editingPayment, clients, systems, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.systemId) return;

    onSave({
      ...formData,
      id: editingPayment?.id || `p_${Math.random().toString(36).substr(2, 9)}`,
    } as PaymentLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">
            {editingPayment ? 'Editar Pagamento' : 'Novo Registro de Pagamento'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Cliente Beneficiário</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                value={formData.clientId}
                onChange={e => {
                  const client = clients.find(c => c.id === e.target.value);
                  setFormData({
                    ...formData, 
                    clientId: e.target.value,
                    systemId: client?.systemId || formData.systemId,
                    amount: client?.amount || formData.amount
                  });
                }}
              >
                <option value="" disabled>Selecione um cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Sistema Origem</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                value={formData.systemId}
                onChange={e => setFormData({...formData, systemId: e.target.value})}
              >
                {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Status do Pagamento</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-bold"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {statusConfigs.map(config => (
                  <option key={config.id} value={config.id}>{config.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Valor (Total)</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 font-bold text-slate-400">R$</span>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-bold"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Data do Pagamento</label>
              <input 
                required
                type="date" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Notas / Observações</label>
              <textarea 
                rows={3}
                placeholder="Detalhes adicionais sobre esta transação..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm resize-none"
                value={formData.notes || ''}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              {editingPayment ? 'Salvar Alterações' : 'Registrar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
