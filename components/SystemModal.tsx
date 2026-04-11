
import React, { useState, useEffect } from 'react';
import { ExternalSystem } from '../types';

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (system: ExternalSystem) => void;
  editingSystem?: ExternalSystem | null;
}

const COLORS = [
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Emerald', class: 'bg-emerald-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Sky', class: 'bg-sky-400' },
  { name: 'Rose', class: 'bg-rose-500' },
  { name: 'Amber', class: 'bg-amber-500' },
  { name: 'Indigo', class: 'bg-indigo-500' },
];

const EMOJIS = ['💼', '✅', '🎓', '🏋️', '☁️', '🚀', '🛒', '🎮', '🎵', '📺', '📱', '🔒'];

const SystemModal: React.FC<SystemModalProps> = ({ isOpen, onClose, onSave, editingSystem }) => {
  const [formData, setFormData] = useState<ExternalSystem>({
    id: '',
    name: '',
    color: 'bg-blue-500',
    icon: '💼'
  });

  useEffect(() => {
    if (editingSystem) {
      setFormData(editingSystem);
    } else {
      setFormData({
        id: `sys_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        color: 'bg-blue-500',
        icon: '💼'
      });
    }
  }, [editingSystem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">
            {editingSystem ? 'Editar Sistema' : 'Novo Sistema'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Nome do Sistema</label>
            <input 
              required
              type="text" 
              placeholder="Ex: SaaS Premium"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Ícone</label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({...formData, icon: emoji})}
                  className={`text-2xl p-2 rounded-xl transition-all ${formData.icon === emoji ? 'bg-indigo-600 scale-110 shadow-lg' : 'bg-slate-50 hover:bg-slate-100'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Cor Temática</label>
            <div className="grid grid-cols-4 gap-3">
              {COLORS.map(color => (
                <button
                  key={color.class}
                  type="button"
                  onClick={() => setFormData({...formData, color: color.class})}
                  className={`h-10 rounded-xl transition-all flex items-center justify-center ${color.class} ${formData.color === color.class ? 'ring-4 ring-offset-2 ring-indigo-200 scale-105' : 'hover:opacity-80'}`}
                >
                  {formData.color === color.class && <span className="text-white text-xs">✓</span>}
                </button>
              ))}
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
              {editingSystem ? 'Salvar Alterações' : 'Adicionar Sistema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemModal;
