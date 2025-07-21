-- =============================================
-- Migration: Create Purchases Table
-- Description: Tracks payment transactions and credit purchases
-- Author: Database Migration
-- Date: 2025-01-01
-- =============================================

-- Create purchases table for tracking payments and credit purchases
CREATE TABLE public.purchases (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User and organization references
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    
    -- Payment provider details
    payment_provider TEXT,
    payment_intent_id TEXT UNIQUE,
    
    -- Purchase details
    amount INTEGER NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    credits_granted INTEGER NOT NULL CHECK (credits_granted >= 0),
    status public.purchase_status NOT NULL DEFAULT 'PENDING',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add table comment
COMMENT ON TABLE public.purchases IS 'Tracks payment transactions and credit purchases for users and organizations';

-- Add column comments
COMMENT ON COLUMN public.purchases.id IS 'Unique identifier for the purchase';
COMMENT ON COLUMN public.purchases.user_id IS 'User who made the purchase';
COMMENT ON COLUMN public.purchases.organization_id IS 'Organization benefiting from purchase (if applicable)';
COMMENT ON COLUMN public.purchases.payment_provider IS 'Payment provider used (e.g., stripe, paypal)';
COMMENT ON COLUMN public.purchases.payment_intent_id IS 'Unique payment intent ID from provider';
COMMENT ON COLUMN public.purchases.amount IS 'Purchase amount in cents';
COMMENT ON COLUMN public.purchases.currency IS 'Currency code (ISO 4217)';
COMMENT ON COLUMN public.purchases.credits_granted IS 'Number of credits granted from this purchase';
COMMENT ON COLUMN public.purchases.status IS 'Current status of the purchase';
COMMENT ON COLUMN public.purchases.metadata IS 'Additional purchase metadata as JSON';

-- Create indexes for performance
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_organization_id ON public.purchases(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_purchases_created_at ON public.purchases(created_at);
CREATE INDEX idx_purchases_payment_intent_id ON public.purchases(payment_intent_id) WHERE payment_intent_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.purchases TO authenticated;

-- =============================================
-- Rollback Instructions:
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS public.purchases CASCADE;
-- =============================================
