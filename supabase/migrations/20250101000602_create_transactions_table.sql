-- =============================================
-- Migration: Create Transactions Table
-- Description: Tracks credit transaction history and audit trail
-- Author: Database Migration
-- Date: 2025-01-01
-- =============================================

-- Create transactions table for credit transaction history
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    context public.account_type NOT NULL,
    credits_used INTEGER NOT NULL CHECK (credits_used <> 0),
    credit_type public.credit_transfer_type NOT NULL,
    related_studio_id UUID REFERENCES public.studios(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add table comment
COMMENT ON TABLE public.transactions IS 'Tracks all credit transactions for audit trail and history';

-- Add column comments
COMMENT ON COLUMN public.transactions.id IS 'Unique identifier for the transaction';
COMMENT ON COLUMN public.transactions.user_id IS 'User performing/initiating the transaction';
COMMENT ON COLUMN public.transactions.credits_used IS 'Amount of credit change (positive for add, negative for spend)';
COMMENT ON COLUMN public.transactions.credit_type IS 'Type of transaction (PURCHASE, SPEND, REFUND, etc.)';
COMMENT ON COLUMN public.transactions.related_studio_id IS 'Related studio if transaction is from studio creation';
COMMENT ON COLUMN public.transactions.description IS 'Human-readable description of the transaction';
COMMENT ON COLUMN public.transactions.created_at IS 'Transaction creation timestamp';
COMMENT ON COLUMN public.transactions.updated_at IS 'Transaction update timestamp';
COMMENT ON COLUMN public.transactions.context IS 'Context of the transaction (personal or organization)';

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_credit_type ON public.transactions(credit_type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transactions_related_studio_id ON public.transactions(related_studio_id) WHERE related_studio_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT SELECT ON public.transactions TO authenticated;