-- =============================================
-- Migration: Create Transactions Table
-- Description: Tracks credit transaction history and audit trail
-- Author: Database Migration
-- Date: 2025-01-01
-- =============================================

-- Create transactions table for credit transaction history
CREATE TABLE public.transactions (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User and organization references
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    
    -- Credit account reference
    credit_account_id UUID NOT NULL REFERENCES public.credits(id) ON DELETE RESTRICT,
    
    -- Transaction details
    change_amount INTEGER NOT NULL, -- Positive for add, negative for spend
    type public.transaction_type NOT NULL,
    
    -- Related entities
    related_purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
    related_studio_id UUID REFERENCES public.studios(id) ON DELETE SET NULL,
    
    -- Description and metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add table comment
COMMENT ON TABLE public.transactions IS 'Tracks all credit transactions for audit trail and history';

-- Add column comments
COMMENT ON COLUMN public.transactions.id IS 'Unique identifier for the transaction';
COMMENT ON COLUMN public.transactions.user_id IS 'User performing/initiating the transaction';
COMMENT ON COLUMN public.transactions.organization_id IS 'Organization context if applicable';
COMMENT ON COLUMN public.transactions.credit_account_id IS 'The credit balance being changed';
COMMENT ON COLUMN public.transactions.change_amount IS 'Amount of credit change (positive for add, negative for spend)';
COMMENT ON COLUMN public.transactions.type IS 'Type of transaction (PURCHASE, SPEND, REFUND, etc.)';
COMMENT ON COLUMN public.transactions.related_purchase_id IS 'Related purchase if transaction is from a purchase';
COMMENT ON COLUMN public.transactions.related_studio_id IS 'Related studio if transaction is from studio creation';
COMMENT ON COLUMN public.transactions.description IS 'Human-readable description of the transaction';
COMMENT ON COLUMN public.transactions.metadata IS 'Additional transaction metadata as JSON';

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_organization_id ON public.transactions(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_transactions_credit_account_id ON public.transactions(credit_account_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transactions_related_purchase_id ON public.transactions(related_purchase_id) WHERE related_purchase_id IS NOT NULL;
CREATE INDEX idx_transactions_related_studio_id ON public.transactions(related_studio_id) WHERE related_studio_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON public.transactions TO authenticated;

-- =============================================
-- Rollback Instructions:
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS public.transactions CASCADE;
-- =============================================
