
import React, { useState, useEffect } from 'react';
import { getPaymentInsights } from '../services/geminiService';
import { Client, PaymentLog, ExternalSystem } from '../types';

interface AIInsightsProps {
  clients: Client[];
  payments: PaymentLog[];
  systems: ExternalSystem[];
  onBack?: () => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ clients, payments, systems, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const fetchInsights = async () => {
    setLoading(true);
    const data = await getPaymentInsights(clients, payments, systems);
    setInsights(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-white rounded-[2.5rem] border p-12 text-center shadow-xl shadow-slate-100 animate-pulse">
        <div className="text-6xl mb-6">✨</div>
        <h3 className="text-xl font-black text-slate-800">A Inteligência Artificial está trabalhando...</h3>
        <p className="text-slate-500 mt-2 font-medium max-w-sm">Analisando tendências de faturamento, taxas de churn e saúde dos seus sistemas SaaS.</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-[2.5rem] border p-12 text-center shadow-xl shadow-slate-100">
        <div className="text-5xl mb-4">🔮</div>
        <h3 className="text-xl font-black text-slate-800">Insights Temporariamente Indisponíveis</h3>
        <p className="text-slate-500 mb-8 font-medium">Ocorreu um erro ao conectar com o motor de IA. Verifique sua chave API.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={fetchInsights}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
          >
            Tentar Novamente
          </button>
          <button 
            onClick={onBack}
            className="bg-white border border-slate-200 text-slate-400 px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-slate-50"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 md:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 text-[200px] leading-none select-none pointer-events-none transform translate-x-20 -translate-y-20">✨</div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <span className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">Análise Consolidada</span>
            <button onClick={onBack} className="text-white/60 hover:text-white transition-colors text-sm font-black uppercase tracking-tighter">« Voltar</button>
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-6 leading-tight">Estado Atual do Negócio</h2>
          <p className="text-indigo-100 text-lg md:text-xl font-medium leading-relaxed max-w-3xl italic">"{insights.summary}"</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="bg-white/15 px-6 py-3 rounded-2xl border border-white/30 backdrop-blur-sm">
              <p className="text-[9px] font-black uppercase text-indigo-200 tracking-widest mb-1">Líder de Faturamento</p>
              <span className="font-black text-xl">{insights.topSystem}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border shadow-sm border-rose-100">
          <h3 className="text-lg font-black mb-6 text-rose-600 flex items-center gap-3">
            <span className="p-2 bg-rose-50 rounded-xl">⚠️</span> Alertas e Riscos
          </h3>
          <ul className="space-y-4">
            {insights.risks.map((risk: string, i: number) => (
              <li key={i} className="flex gap-4 text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-start group hover:border-rose-200 transition-colors">
                <span className="w-6 h-6 shrink-0 bg-rose-500 rounded-lg flex items-center justify-center text-[10px] text-white font-bold">{i+1}</span>
                <p className="text-sm font-medium leading-relaxed">{risk}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border shadow-sm border-emerald-100">
          <h3 className="text-lg font-black mb-6 text-emerald-600 flex items-center gap-3">
            <span className="p-2 bg-emerald-50 rounded-xl">💡</span> Recomendações Estratégicas
          </h3>
          <ul className="space-y-4">
            {insights.recommendations.map((rec: string, i: number) => (
              <li key={i} className="flex gap-4 text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-start group hover:border-emerald-200 transition-colors">
                <span className="w-6 h-6 shrink-0 bg-emerald-500 rounded-lg flex items-center justify-center text-xs text-white font-bold">✓</span>
                <p className="text-sm font-medium leading-relaxed">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="flex justify-center gap-4 py-8">
        <button 
          onClick={fetchInsights}
          className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-indigo-600 uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-slate-100 hover:shadow-xl transition-all active:scale-95"
        >
          🔄 Refazer Análise
        </button>
        <button 
          onClick={onBack}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          Ir para o Painel
        </button>
      </div>
    </div>
  );
};

export default AIInsights;
