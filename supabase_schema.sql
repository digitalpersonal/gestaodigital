-- SCRIPT DE ATUALIZAÇÃO (Execute isso no SQL Editor do Supabase se já tiver as tabelas)
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'monthly';
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;

-- Create tables

CREATE TABLE external_systems (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL
);

CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    system_id TEXT REFERENCES external_systems(id),
    status TEXT NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    plan_name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    next_billing_date DATE NOT NULL,
    annual_renewal_date DATE,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE payment_logs (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id),
    client_name TEXT,
    system_id TEXT REFERENCES external_systems(id),
    amount DECIMAL(10, 2) NOT NULL,
    cost_amount DECIMAL(10, 2),
    date DATE NOT NULL,
    status TEXT NOT NULL,
    type TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    system_id TEXT REFERENCES external_systems(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE payment_status_configs (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    color_class TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

-- Insert data into external_systems
INSERT INTO external_systems (id, name, color, icon) VALUES
('sys_guarafood', 'GuaraFood', 'bg-orange-500', '🍔'),
('sys_ridecar', 'RideCar', 'bg-yellow-500', '🚗'),
('sys_redeguara', 'RedeGuara', 'bg-indigo-500', '🌐'),
('sys_agendaguara', 'AgendaGuara', 'bg-emerald-500', '📅'),
('sys_multisaas', 'Multi SaaS', 'bg-purple-600', '🚀'),
('sys_multifood', 'MultiFood', 'bg-rose-500', '🍕'),
('sys_fincontrol', 'FinControl', 'bg-cyan-600', '📈'),
('sys_hosting', 'Hospedagem Anual', 'bg-sky-400', '☁️');

-- Insert data into clients
INSERT INTO clients (id, name, email, phone, system_id, status, plan_name, amount, discount, currency, next_billing_date) VALUES
('c_1', 'Restaurante Sabor Real', 'contato@saborreal.com.br', '5511999999999', 'sys_guarafood', 'active', 'Plano Premium Mensal', 149.90, 0, 'BRL', '2024-06-15'),
('c_2', 'Carlos Oliveira (Motorista)', 'carlos.ride@email.com', '5511888888888', 'sys_ridecar', 'active', 'Taxa Administrativa', 89.90, 10, 'BRL', '2024-06-10'),
('c_3', 'Clínica OdontoGuara', 'financeiro@odontoguara.com', '5511777777777', 'sys_agendaguara', 'active', 'Profissional', 199.00, 0, 'BRL', '2024-06-20'),
('c_4', 'João Mendes Tech', 'joao@tech.com', '5511666666666', 'sys_hosting', 'active', 'Cloud Anual 10GB', 580.00, 50, 'BRL', '2025-05-01'),
('c_5', 'Market Rede Central', 'rede@market.com', '5511555555555', 'sys_redeguara', 'active', 'Plano RedeGuara R$ 150', 150.00, 0, 'BRL', '2024-06-05');

-- Insert data into payment_logs
INSERT INTO payment_logs (id, client_id, system_id, amount, date, status, type, notes) VALUES
('p_1', 'c_1', 'sys_guarafood', 149.90, '2024-05-15', 'paid', 'subscription', 'Pagamento via PIX'),
('p_2', 'c_2', 'sys_ridecar', 79.90, '2024-05-10', 'paid', 'subscription', 'Renovação com desconto'),
('p_3', 'c_5', 'sys_redeguara', 150.00, '2024-05-05', 'paid', 'subscription', 'Pagamento RedeGuara');

-- Insert data into expenses
INSERT INTO expenses (id, description, category, amount, due_date, status) VALUES
('e_1', 'Aluguel Sala Comercial', 'Aluguel', 1500.00, '2024-05-05', 'paid'),
('e_2', 'Servidor VPS (DigitalOcean)', 'Software/Ferramentas', 480.00, '2024-05-15', 'paid'),
('e_3', 'Google Workspace', 'Software/Ferramentas', 85.50, '2024-05-20', 'pending');

-- Insert data into payment_status_configs
INSERT INTO payment_status_configs (id, label, color_class, is_default) VALUES
('paid', 'Pago', 'bg-emerald-100 text-emerald-700 border-emerald-200', true),
('pending', 'Pendente', 'bg-amber-100 text-amber-700 border-amber-200', true);

-- DESATIVAR RLS PARA TESTES (Execute se tiver erro de permissão)
-- ALTER TABLE external_systems DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE payment_logs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE payment_status_configs DISABLE ROW LEVEL SECURITY;
