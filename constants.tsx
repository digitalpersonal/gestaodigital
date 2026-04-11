import { ExternalSystem, Client, PaymentLog, SubscriptionStatus, PaymentStatus, Expense, ExpenseCategory, PaymentType } from './types';

export const EXTERNAL_SYSTEMS: ExternalSystem[] = [
  { id: 'sys_guarafood', name: 'GuaraFood', color: 'bg-orange-500', icon: '🍔' },
  { id: 'sys_ridecar', name: 'RideCar', color: 'bg-yellow-500', icon: '🚗' },
  { id: 'sys_redeguara', name: 'RedeGuara', color: 'bg-indigo-500', icon: '🌐' },
  { id: 'sys_agendaguara', name: 'AgendaGuara', color: 'bg-emerald-500', icon: '📅' },
  { id: 'sys_multisaas', name: 'Multi SaaS', color: 'bg-purple-600', icon: '🚀' },
  { id: 'sys_multifood', name: 'MultiFood', color: 'bg-rose-500', icon: '🍕' },
  { id: 'sys_fincontrol', name: 'FinControl', color: 'bg-cyan-600', icon: '📈' },
  { id: 'sys_hosting', name: 'Hospedagem Anual', color: 'bg-sky-400', icon: '☁️' }
];

export const MOCK_CLIENTS: Client[] = [
  { 
    id: 'c_1', 
    name: 'Restaurante Sabor Real', 
    email: 'contato@saborreal.com.br', 
    phone: '5511999999999', 
    systemId: 'sys_guarafood', 
    status: SubscriptionStatus.ACTIVE, 
    planName: 'Plano Premium Mensal', 
    amount: 149.90, 
    discount: 0, 
    currency: 'BRL', 
    nextBillingDate: '2024-06-15' 
  },
  { 
    id: 'c_2', 
    name: 'Carlos Oliveira (Motorista)', 
    email: 'carlos.ride@email.com', 
    phone: '5511888888888', 
    systemId: 'sys_ridecar', 
    status: SubscriptionStatus.ACTIVE, 
    planName: 'Taxa Administrativa', 
    amount: 89.90, 
    discount: 10, 
    currency: 'BRL', 
    nextBillingDate: '2024-06-10' 
  },
  { 
    id: 'c_3', 
    name: 'Clínica OdontoGuara', 
    email: 'financeiro@odontoguara.com', 
    phone: '5511777777777', 
    systemId: 'sys_agendaguara', 
    status: SubscriptionStatus.ACTIVE, 
    planName: 'Profissional', 
    amount: 199.00, 
    discount: 0, 
    currency: 'BRL', 
    nextBillingDate: '2024-06-20' 
  },
  { 
    id: 'c_4', 
    name: 'João Mendes Tech', 
    email: 'joao@tech.com', 
    phone: '5511666666666', 
    systemId: 'sys_hosting', 
    status: SubscriptionStatus.ACTIVE, 
    planName: 'Cloud Anual 10GB', 
    amount: 580.00, 
    discount: 50, 
    currency: 'BRL', 
    nextBillingDate: '2025-05-01' 
  },
  { 
    id: 'c_5', 
    name: 'Market Rede Central', 
    email: 'rede@market.com', 
    phone: '5511555555555', 
    systemId: 'sys_redeguara', 
    status: SubscriptionStatus.ACTIVE, 
    planName: 'Plano RedeGuara R$ 150', 
    amount: 150.00, 
    discount: 0, 
    currency: 'BRL', 
    nextBillingDate: '2024-06-05' 
  }
];

export const MOCK_PAYMENTS: PaymentLog[] = [
  { id: 'p_1', clientId: 'c_1', systemId: 'sys_guarafood', amount: 149.90, date: '2024-05-15', status: PaymentStatus.PAID, type: PaymentType.SUBSCRIPTION, notes: 'Pagamento via PIX' },
  { id: 'p_2', clientId: 'c_2', systemId: 'sys_ridecar', amount: 79.90, date: '2024-05-10', status: PaymentStatus.PAID, type: PaymentType.SUBSCRIPTION, notes: 'Renovação com desconto' },
  { id: 'p_3', clientId: 'c_5', systemId: 'sys_redeguara', amount: 150.00, date: '2024-05-05', status: PaymentStatus.PAID, type: PaymentType.SUBSCRIPTION, notes: 'Pagamento RedeGuara' }
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'e_1', description: 'Aluguel Sala Comercial', category: ExpenseCategory.RENT, amount: 1500.00, dueDate: '2024-05-05', status: 'paid' },
  { id: 'e_2', description: 'Servidor VPS (DigitalOcean)', category: ExpenseCategory.SOFTWARE, amount: 480.00, dueDate: '2024-05-15', status: 'paid' },
  { id: 'e_3', description: 'Google Workspace', category: ExpenseCategory.SOFTWARE, amount: 85.50, dueDate: '2024-05-20', status: 'pending' }
];