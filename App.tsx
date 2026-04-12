
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import AIInsights from './components/AIInsights';
import PaymentHistory from './components/PaymentHistory';
import ExpenseList from './components/ExpenseList';
import FinancialClosing from './components/FinancialClosing';
import ClientModal from './components/ClientModal';
import SystemModal from './components/SystemModal';
import PaymentModal from './components/PaymentModal';
import ExpenseModal from './components/ExpenseModal';
import ProductSaleModal from './components/ProductSaleModal';
import Login from './components/Login';
import SystemDetailView from './components/SystemDetailView';
import { Client, ExternalSystem, PaymentLog, PaymentStatus, Expense, PaymentType, PaymentStatusConfig, BillingCycle } from './types';
import { generateMonthlyReport } from './services/reportService';
import { supabase } from './services/supabase';

const DEFAULT_STATUS_CONFIGS: PaymentStatusConfig[] = [
  { id: 'paid', label: 'Pago', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200', isDefault: true },
  { id: 'pending', label: 'Pendente', colorClass: 'bg-amber-100 text-amber-700 border-amber-200', isDefault: true },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'info'} | null>(null);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [systems, setSystems] = useState<ExternalSystem[]>([]);
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [statusConfigs, setStatusConfigs] = useState<PaymentStatusConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  const [clientFilterSystemId, setClientFilterSystemId] = useState('all');
  const [viewingSystemId, setViewingSystemId] = useState<string | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingSystem, setEditingSystem] = useState<ExternalSystem | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentLog | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const checkConfig = () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!url || url.includes('placeholder') || !key || key.includes('placeholder')) {
        setSupabaseConfigured(false);
      }
    };
    checkConfig();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn) return;
      
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || url.includes('placeholder') || !key || key.includes('placeholder')) {
        console.warn('Supabase not configured. Using empty state.');
        setSupabaseConfigured(false);
        return;
      }

      setIsLoading(true);
      try {
        const [
          { data: systemsData, error: systemsError },
          { data: clientsData, error: clientsError },
          { data: paymentsData, error: paymentsError },
          { data: expensesData, error: expensesError },
          { data: statusConfigsData, error: statusConfigsError }
        ] = await Promise.all([
          supabase.from('external_systems').select('*'),
          supabase.from('clients').select('*'),
          supabase.from('payment_logs').select('*'),
          supabase.from('expenses').select('*'),
          supabase.from('payment_status_configs').select('*')
        ]);

        if (systemsError) throw systemsError;
        if (clientsError) throw clientsError;
        if (paymentsError) throw paymentsError;
        if (expensesError) throw expensesError;
        if (statusConfigsError) throw statusConfigsError;

        if (systemsData) setSystems(systemsData.map(s => ({...s, id: s.id})));
        
        if (clientsData) {
          setClients(clientsData.map(c => ({
            ...c, 
            systemId: c.system_id, 
            planName: c.plan_name, 
            billingCycle: c.billing_cycle || BillingCycle.MONTHLY,
            nextBillingDate: c.next_billing_date,
            annualRenewalDate: c.annual_renewal_date
          })));
        }

        if (paymentsData) {
          setPayments(paymentsData.map(p => ({
            ...p,
            clientId: p.client_id,
            systemId: p.system_id,
            clientName: p.client_name,
            costAmount: p.cost_amount
          })));
        }

        if (expensesData) {
          setExpenses(expensesData.map(e => ({
            ...e,
            dueDate: e.due_date,
            systemId: e.system_id
          })));
        }

        if (statusConfigsData) {
          if (statusConfigsData.length > 0) {
            setStatusConfigs(statusConfigsData.map(s => ({
              ...s,
              colorClass: s.color_class,
              isDefault: s.is_default
            })));
          } else {
            setStatusConfigs(DEFAULT_STATUS_CONFIGS);
          }
        }
        
        setSupabaseConfigured(true);
        
        // Se as tabelas existem mas estão vazias, pode ser que o usuário não rodou o SQL
        if (systemsData?.length === 0 && clientsData?.length === 0) {
          console.info('Database connected but empty. Did you run the SQL script?');
        }

      } catch (error: any) {
        console.error('Error fetching data:', error);
        let msg = "Erro ao conectar com Supabase.";
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          msg = "Tabelas não encontradas. Você rodou o script SQL no Supabase?";
        } else if (error.message?.includes('JWT') || error.code === 'PGRST301') {
          msg = "Erro de autenticação/RLS. Verifique as políticas no Supabase.";
        }
        showToast(msg, "info");
        setSupabaseConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  const handleLogin = (password: string) => {
    if (password === 'Mld3602#?+') {
      setIsLoggedIn(true);
      setLoginError('');
      showToast("Bem-vindo de volta!");
    } else {
      setLoginError("Senha incorreta.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setViewingSystemId(null);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'clients') {
      setClientFilterSystemId('all');
    }
    if (tab === 'systems') {
      setViewingSystemId(null);
    }
    setActiveTab(tab);
  };

  const handleSaveClient = async (client: Client) => {
    try {
      const clientData = {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        system_id: client.systemId,
        status: client.status,
        billing_cycle: client.billingCycle,
        plan_name: client.planName,
        amount: client.amount,
        discount: client.discount || 0,
        currency: client.currency || 'BRL',
        next_billing_date: client.nextBillingDate,
        annual_renewal_date: client.annualRenewalDate,
        history: client.history || []
      };

      if (editingClient) {
        const { error } = await supabase.from('clients').update(clientData).eq('id', client.id);
        if (error) throw error;
        setClients(clients.map(c => c.id === client.id ? client : c));
        showToast(`Cliente ${client.name} atualizado!`);
      } else {
        const { error: insertError } = await supabase.from('clients').insert([clientData]);
        if (insertError) throw insertError;
        
        const finalAmount = Math.max(0, client.amount - (client.discount || 0));
        const installments: PaymentLog[] = [];
        let currentDate = new Date(client.nextBillingDate);
        
        // Determinar número de parcelas e intervalo
        let numInstallments = 1;
        if (client.billingCycle === BillingCycle.MONTHLY) numInstallments = 12;
        else if (client.billingCycle === BillingCycle.WEEKLY) numInstallments = 52;
        else if (client.billingCycle === BillingCycle.ANNUAL) numInstallments = 2;
        else if (client.billingCycle === BillingCycle.ONETIME) numInstallments = 1;

        for (let i = 1; i <= numInstallments; i++) {
          installments.push({
            id: `p_${Math.random().toString(36).substr(2, 9)}`,
            clientId: client.id,
            systemId: client.systemId,
            amount: finalAmount,
            date: currentDate.toISOString().split('T')[0],
            status: 'pending',
            type: PaymentType.SUBSCRIPTION,
            notes: client.billingCycle === BillingCycle.ONETIME 
              ? 'Pagamento Único' 
              : `Parcela ${i}/${numInstallments} (${client.billingCycle})`
          });

          // Avançar data conforme o ciclo
          if (client.billingCycle === BillingCycle.MONTHLY) {
            currentDate.setMonth(currentDate.getMonth() + 1);
          } else if (client.billingCycle === BillingCycle.WEEKLY) {
            currentDate.setDate(currentDate.getDate() + 7);
          } else if (client.billingCycle === BillingCycle.ANNUAL) {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
          } else {
            break; // Pagamento único não avança
          }
        }
        
        const paymentsData = installments.map(p => ({
          id: p.id,
          client_id: p.clientId,
          system_id: p.systemId,
          amount: p.amount,
          date: p.date,
          status: p.status,
          type: p.type,
          notes: p.notes
        }));

        const { error: paymentsError } = await supabase.from('payment_logs').insert(paymentsData);
        if (paymentsError) throw paymentsError;
        
        setClients([client, ...clients]);
        setPayments([...installments, ...payments]);
        showToast(`${client.name} cadastrado com sucesso!`);
      }
      setEditingClient(null);
    } catch (error: any) {
      console.error('Error saving client:', error);
      showToast(`Erro ao salvar: ${error.message || 'Verifique sua conexão'}`, "info");
    }
  };

  const handleSaveSystem = async (system: ExternalSystem) => {
    try {
      if (editingSystem) {
        await supabase.from('external_systems').update(system).eq('id', system.id);
        setSystems(systems.map(s => s.id === system.id ? system : s));
        showToast(`Sistema ${system.name} atualizado!`);
      } else {
        await supabase.from('external_systems').insert([system]);
        setSystems([...systems, system]);
        showToast(`Sistema ${system.name} adicionado!`);
      }
      setEditingSystem(null);
    } catch (error) {
      console.error('Error saving system:', error);
      showToast("Erro ao salvar sistema", "info");
    }
  };

  const handleSavePayment = async (payment: PaymentLog) => {
    try {
      const paymentData = {
        id: payment.id,
        client_id: payment.clientId,
        client_name: payment.clientName,
        system_id: payment.systemId,
        amount: payment.amount,
        cost_amount: payment.costAmount,
        date: payment.date,
        status: payment.status,
        type: payment.type,
        notes: payment.notes
      };

      if (editingPayment) {
        await supabase.from('payment_logs').update(paymentData).eq('id', payment.id);
        setPayments(payments.map(p => p.id === payment.id ? payment : p));
        showToast("Pagamento atualizado!");
      } else {
        await supabase.from('payment_logs').insert([paymentData]);
        setPayments([payment, ...payments]);
        showToast("Recebimento registrado com sucesso!");
      }
      setEditingPayment(null);
    } catch (error) {
      console.error('Error saving payment:', error);
      showToast("Erro ao salvar pagamento", "info");
    }
  };

  const handleSaveProductSale = async (sale: PaymentLog) => {
    try {
      const saleData = {
        id: sale.id,
        client_id: sale.clientId,
        client_name: sale.clientName,
        system_id: sale.systemId,
        amount: sale.amount,
        cost_amount: sale.costAmount,
        date: sale.date,
        status: sale.status,
        type: sale.type,
        notes: sale.notes
      };
      await supabase.from('payment_logs').insert([saleData]);
      setPayments([sale, ...payments]);
      showToast(`Venda de ${sale.notes} registrada!`, 'success');
    } catch (error) {
      console.error('Error saving product sale:', error);
      showToast("Erro ao salvar venda", "info");
    }
  };

  const handleSaveExpense = async (expense: Expense) => {
    try {
      const expenseData = {
        id: expense.id,
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        due_date: expense.dueDate,
        status: expense.status,
        notes: expense.notes,
        system_id: expense.systemId
      };

      if (editingExpense) {
        await supabase.from('expenses').update(expenseData).eq('id', expense.id);
        setExpenses(expenses.map(e => e.id === expense.id ? expense : e));
        showToast("Despesa atualizada!");
      } else {
        await supabase.from('expenses').insert([expenseData]);
        setExpenses([expense, ...expenses]);
        showToast("Nova despesa registrada!");
      }
      setEditingExpense(null);
    } catch (error) {
      console.error('Error saving expense:', error);
      showToast("Erro ao salvar despesa", "info");
    }
  };

  const handleUpdateStatusConfigs = async (newConfigs: PaymentStatusConfig[]) => {
    try {
      const configsData = newConfigs.map(c => ({
        id: c.id,
        label: c.label,
        color_class: c.colorClass,
        is_default: c.isDefault
      }));
      await supabase.from('payment_status_configs').upsert(configsData);
      setStatusConfigs(newConfigs);
      showToast("Configurações de status atualizadas!");
    } catch (error) {
      console.error('Error updating status configs:', error);
      showToast("Erro ao atualizar configurações", "info");
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await supabase.from('clients').delete().eq('id', id);
      setClients(clients.filter(c => c.id !== id));
      showToast("Cliente excluído!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await supabase.from('expenses').delete().eq('id', id);
      setExpenses(expenses.filter(ex => ex.id !== id));
      showToast("Despesa excluída!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleExpense = async (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    const newStatus = expense.status === 'paid' ? 'pending' : 'paid';
    try {
      await supabase.from('expenses').update({ status: newStatus }).eq('id', id);
      setExpenses(expenses.map(ex => id === ex.id ? {...ex, status: newStatus} : ex));
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuickPay = async (id: string) => {
    try {
      await supabase.from('payment_logs').update({ status: 'paid' }).eq('id', id);
      setPayments(payments.map(p => p.id === id ? {...p, status: 'paid'} : p));
      showToast("Pagamento baixado!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateReport = () => {
    showToast("Gerando relatório consolidado...");
    try {
      generateMonthlyReport(clients, payments, systems, expenses);
      showToast("PDF baixado!");
    } catch (e) {
      showToast("Erro ao gerar PDF", "info");
    }
  };

  const handleGlobalNewRecord = () => {
    if (activeTab === 'systems') {
      setEditingSystem(null);
      setIsSystemModalOpen(true);
    } else if (activeTab === 'payments') {
      setEditingPayment(null);
      setIsPaymentModalOpen(true);
    } else if (activeTab === 'expenses') {
      setEditingExpense(null);
      setIsExpenseModalOpen(true);
    } else {
      setEditingClient(null);
      setIsClientModalOpen(true);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  const tabTitles: Record<string, string> = {
    dashboard: 'Fluxo de Caixa',
    closing: 'Fechamento Financeiro',
    clients: 'Base de Clientes',
    systems: 'Gestão de Sistemas',
    payments: 'Receitas de Sistemas',
    expenses: 'Saídas Operacionais',
    insights: 'Inteligência Financeira'
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          clients={clients} 
          payments={payments} 
          systems={systems} 
          expenses={expenses}
          onNavigate={setActiveTab} 
        />;
      case 'closing':
        return <FinancialClosing 
          payments={payments} 
          expenses={expenses} 
          systems={systems} 
        />;
      case 'clients':
        return <ClientList 
          clients={clients} 
          systems={systems} 
          initialFilter={clientFilterSystemId}
          onManageClient={(client) => { setEditingClient(client); setIsClientModalOpen(true); }}
          onDeleteClient={handleDeleteClient}
        />;
      case 'systems':
        if (viewingSystemId) {
          const sys = systems.find(s => s.id === viewingSystemId);
          if (!sys) return null;
          return (
            <SystemDetailView 
              system={sys}
              clients={clients}
              payments={payments}
              expenses={expenses}
              allSystems={systems}
              onBack={() => setViewingSystemId(null)}
              onEditSystem={(s) => { setEditingSystem(s); setIsSystemModalOpen(true); }}
              onEditClient={(c) => { setEditingClient(c); setIsClientModalOpen(true); }}
              onDeleteClient={handleDeleteClient}
              onEditPayment={(p) => { setEditingPayment(p); setIsPaymentModalOpen(true); }}
              onEditExpense={(e) => { setEditingExpense(e); setIsExpenseModalOpen(true); }}
              onDeleteExpense={handleDeleteExpense}
              onToggleExpense={handleToggleExpense}
              onNewClient={() => { 
                setEditingClient({ systemId: sys.id } as Client); 
                setIsClientModalOpen(true); 
              }}
              onNewPayment={() => {
                setEditingPayment({ systemId: sys.id } as PaymentLog);
                setIsPaymentModalOpen(true);
              }}
              statusConfigs={statusConfigs}
            />
          );
        }
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
            {systems.map(sys => (
              <div 
                key={sys.id} 
                onClick={() => setViewingSystemId(sys.id)}
                className="bg-white p-6 rounded-2xl border text-center hover:shadow-xl transition-all relative group cursor-pointer hover:border-indigo-200"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{sys.icon}</div>
                <h3 className="text-lg font-black text-slate-800">{sys.name}</h3>
                <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest">
                  {sys.id === 'sys_graphic' ? payments.filter(p => p.type === PaymentType.PRODUCT).length : clients.filter(c => c.systemId === sys.id).length} Clientes
                </p>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSystem(sys);
                    setIsSystemModalOpen(true);
                  }}
                  className="absolute top-3 right-3 p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Configurações do Sistema"
                >
                   <span className="text-sm">⚙️</span>
                </button>

                <div className="mt-4 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Ver Gestão 360 ➜</span>
                </div>
              </div>
            ))}
            <button 
              onClick={() => { setEditingSystem(null); setIsSystemModalOpen(true); }}
              className="border-2 border-dashed border-slate-200 p-8 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-2">+</span>
              <span className="text-xs font-bold uppercase">Novo Sistema</span>
            </button>
          </div>
        );
      case 'payments':
        return <PaymentHistory 
          payments={payments} 
          systems={systems} 
          clients={clients} 
          statusConfigs={statusConfigs}
          onUpdateStatusConfigs={handleUpdateStatusConfigs}
          onQuickPay={handleQuickPay}
          onEditPayment={p => { setEditingPayment(p); setIsPaymentModalOpen(true); }}
          onNewManualPayment={() => { setEditingPayment(null); setIsPaymentModalOpen(true); }}
        />;
      case 'expenses':
        return <ExpenseList 
          expenses={expenses}
          onEdit={e => { setEditingExpense(e); setIsExpenseModalOpen(true); }}
          onDelete={handleDeleteExpense}
          onToggleStatus={handleToggleExpense}
        />;
      case 'insights':
        return <AIInsights clients={clients} payments={payments} systems={systems} onBack={() => setActiveTab('dashboard')} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        isOpen={isMenuOpen} 
        setIsOpen={setIsMenuOpen}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 p-3 md:p-8 w-full max-w-full flex flex-col">
        <div className="flex-1">
          {notification && (
            <div className="fixed top-4 right-4 z-[200] px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-2xl animate-bounce">
              {notification.message}
            </div>
          )}

          <header className="mb-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 active:scale-95 transition-all shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="overflow-hidden">
                  <h2 className="text-lg md:text-2xl font-black text-slate-900 leading-tight truncate">
                    {viewingSystemId ? `Módulo: ${systems.find(s => s.id === viewingSystemId)?.name}` : tabTitles[activeTab]}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5 md:mt-1">
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate opacity-80">
                      Digital Freeshop Admin
                    </p>
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${supabaseConfigured ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      <span className={`w-1 h-1 rounded-full ${supabaseConfigured ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                      {supabaseConfigured ? 'Supabase Conectado' : 'Supabase Desconectado'}
                    </div>
                    {(activeTab !== 'dashboard' || viewingSystemId) && (
                      <button 
                        onClick={() => {
                          if (viewingSystemId) setViewingSystemId(null);
                          else setActiveTab('dashboard');
                        }}
                        className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1 hover:text-indigo-700 transition-colors"
                      >
                        <span className="text-xs">«</span> Voltar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleGenerateReport} 
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors shadow-sm shrink-0 active:bg-slate-50"
                title="Gerar Relatório PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button 
                onClick={() => setIsProductModalOpen(true)} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-cyan-500 text-white rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-cyan-100 hover:bg-cyan-600 transition-all active:scale-95 whitespace-nowrap overflow-hidden"
              >
                <span className="text-sm md:text-lg shrink-0">🎨</span> <span className="truncate">Gráfica</span>
              </button>
              <button 
                onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-rose-500 text-white rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95 whitespace-nowrap overflow-hidden"
              >
                <span className="text-sm md:text-lg shrink-0">💸</span> <span className="truncate">Despesa</span>
              </button>
              <button 
                onClick={handleGlobalNewRecord} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-indigo-600 text-white rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <span className="text-sm md:text-lg shrink-0">+</span> <span>Novo Registro</span>
              </button>
            </div>
          </header>

          <div className="w-full">
            {!supabaseConfigured && isLoggedIn && (
              <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-4 animate-in slide-in-from-top duration-500">
                <div className="flex items-start gap-4">
                  <div className="text-3xl mt-1">🚀</div>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-amber-900">Configuração do Supabase Necessária</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      O sistema está pronto, mas precisa se conectar ao seu banco de dados para carregar e salvar informações permanentemente.
                    </p>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <span className="w-5 h-5 flex items-center justify-center bg-amber-200 rounded-full text-[10px]">1</span>
                        Configure as chaves <b>VITE_SUPABASE_URL</b> e <b>VITE_SUPABASE_ANON_KEY</b> no menu de Configurações (Secrets).
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <span className="w-5 h-5 flex items-center justify-center bg-amber-200 rounded-full text-[10px]">2</span>
                        Copie o conteúdo do arquivo <b>supabase_schema.sql</b> e execute no SQL Editor do seu painel Supabase.
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <span className="w-5 h-5 flex items-center justify-center bg-amber-200 rounded-full text-[10px]">3</span>
                        Certifique-se de que o RLS (Row Level Security) está desativado ou com políticas de acesso configuradas.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-amber-100">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-amber-600 text-white text-xs font-black rounded-xl hover:bg-amber-700 transition-all active:scale-95 shadow-lg shadow-amber-200"
                  >
                    Verificar Conexão Agora
                  </button>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}
            <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSave={handleSaveClient} systems={systems} editingClient={editingClient} />
            <SystemModal isOpen={isSystemModalOpen} onClose={() => setIsSystemModalOpen(false)} onSave={handleSaveSystem} editingSystem={editingSystem} />
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSave={handleSavePayment} clients={clients} systems={systems} editingPayment={editingPayment} statusConfigs={statusConfigs} />
            <ExpenseModal 
              isOpen={isExpenseModalOpen} 
              onClose={() => setIsExpenseModalOpen(false)} 
              onSave={handleSaveExpense} 
              editingExpense={editingExpense} 
              systems={systems}
            />
            <ProductSaleModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSave={handleSaveProductSale} clients={clients} />

            {renderContent()}
          </div>
        </div>

        <footer className="mt-12 py-6 border-t border-slate-200 text-center text-[10px] md:text-xs text-slate-400 font-medium space-y-1">
          <p>&copy; 2026 Desenvolvido por Multiplus - Sistemas Inteligentes</p>
          <p>Silvio T. de Sá Filho</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
