
export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface PaymentStatusConfig {
  id: string;
  label: string;
  colorClass: string;
  isDefault?: boolean;
}

export enum PaymentType {
  SUBSCRIPTION = 'subscription',
  PRODUCT = 'product'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  TRIAL = 'trial'
}

export enum BillingCycle {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  ONETIME = 'onetime'
}

export enum ExpenseCategory {
  RENT = 'Aluguel',
  UTILITIES = 'Água/Luz/Gás',
  INTERNET = 'Internet/Telefone',
  LOAN = 'Empréstimos',
  SOFTWARE = 'Software/Ferramentas',
  TAXES = 'Impostos',
  MARKETING = 'Marketing/Ads',
  SALARY = 'Pro-labore/Salários',
  OTHERS = 'Outros'
}

export interface HistoryEntry {
  id: string;
  date: string;
  adminName: string;
  field: 'status' | 'planName' | 'amount' | 'discount' | 'billingCycle';
  oldValue: string | number;
  newValue: string | number;
}

export interface ExternalSystem {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  systemId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  planName: string;
  amount: number; 
  discount: number; 
  currency: string;
  nextBillingDate: string;
  annualRenewalDate?: string;
  history?: HistoryEntry[];
}

export interface PaymentLog {
  id: string;
  clientId: string;
  clientName?: string;
  systemId: string;
  amount: number;
  costAmount?: number;
  date: string;
  status: string; // Changed from enum to string to support custom statuses
  type: PaymentType;
  notes?: string;
}

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
  notes?: string;
  systemId?: string;
}

export interface DashboardStats {
  totalMRR: number;
  activeClients: number;
  churnRate: number;
  failureRate: number;
}
