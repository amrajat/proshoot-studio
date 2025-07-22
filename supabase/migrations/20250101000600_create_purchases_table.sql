-- =============================================
-- Migration: Create Purchases Table
-- Description: Tracks payment transactions and credit purchases
-- Author: Database Migration
-- Date: 2025-01-01
-- =============================================

-- Create purchases table for tracking payments and credit purchases
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    payment_provider public.payment_provider NOT NULL,
    provider_payment_id TEXT UNIQUE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    credits_granted INTEGER,
    credits_type public.credit_transfer_type NOT NULL,
    status public.purchase_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    metadata JSONB
);

-- Add table comment
COMMENT ON TABLE public.purchases IS 'Tracks payment transactions and credit purchases for users and organizations';

-- Add column comments
COMMENT ON COLUMN public.purchases.id IS 'Unique identifier for the purchase';
COMMENT ON COLUMN public.purchases.user_id IS 'User who made the purchase';
COMMENT ON COLUMN public.purchases.payment_provider IS 'Payment provider used (e.g., stripe, paypal)';
COMMENT ON COLUMN public.purchases.provider_payment_id IS 'Unique payment intent ID from provider';
COMMENT ON COLUMN public.purchases.amount IS 'Purchase amount in cents';
COMMENT ON COLUMN public.purchases.currency IS 'Currency code (ISO 4217)';
COMMENT ON COLUMN public.purchases.credits_granted IS 'credits granted from this purchase';
COMMENT ON COLUMN public.purchases.credits_type IS 'Type of credits granted';
COMMENT ON COLUMN public.purchases.status IS 'Current status of the purchase';
COMMENT ON COLUMN public.purchases.created_at IS 'Purchase creation timestamp';
COMMENT ON COLUMN public.purchases.updated_at IS 'Purchase update timestamp';
COMMENT ON COLUMN public.purchases.metadata IS 'Additional metadata for the purchase';

-- Create indexes for performance
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_purchases_created_at ON public.purchases(created_at);
CREATE INDEX idx_purchases_provider_payment_id ON public.purchases(provider_payment_id) WHERE provider_payment_id IS NOT NULL;
CREATE INDEX idx_purchases_metadata ON public.purchases USING GIN (metadata);

-- Enable Row Level Security
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT SELECT ON public.purchases TO authenticated;

-- =============================================
-- Rollback Instructions:
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS public.purchases CASCADE;
-- =============================================
