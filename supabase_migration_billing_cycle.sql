-- Add billing_cycle column to clients table
ALTER TABLE clients ADD COLUMN billing_cycle TEXT NOT NULL DEFAULT 'monthly';
