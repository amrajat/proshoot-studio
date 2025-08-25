-- ============================================================================
-- MIGRATION: Setup Extensions and Enums
-- DESCRIPTION: Initialize required PostgreSQL extensions and custom enum types
-- DEPENDENCIES: None (foundational migration)
-- BREAKING CHANGES: None
-- ROLLBACK: DROP TYPE statements in reverse order, then DROP EXTENSION
-- ============================================================================

-- Set session configuration for safety
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = ON;
SELECT pg_catalog.set_config('search_path', '', FALSE);
SET check_function_bodies = FALSE;
SET xmloption = content;
SET client_min_messages = WARNING;
SET row_security = OFF;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgsodium";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Ensure public schema comment
COMMENT ON SCHEMA "public" IS 'Standard public schema';

-- ============================================================================
-- CUSTOM ENUM TYPES
-- ============================================================================

-- Invitation status for organization invites
CREATE TYPE public.invitation_status AS ENUM (
    'PENDING',
    'ACCEPTED', 
    'EXPIRED',
    'DENIED',
    'CANCELLED'
);

-- Organization member roles
CREATE TYPE public.organization_role AS ENUM (
    'OWNER',
    'MEMBER'
);

-- Studio processing status
CREATE TYPE public.studio_status AS ENUM (
    'FAILED',
    'PAYMENT_PENDING',
    'PROCESSING',
    'COMPLETED',
    'ACCEPTED',
    'REFUNDED',
    'DELETED'
);

-- Purchase transaction status
CREATE TYPE public.purchase_status AS ENUM (
    'SUCCEEDED',
    'PENDING',
    'FAILED'
);


-- Credit transfer types for different plans
CREATE TYPE public.credit_transfer_type AS ENUM (
    'STARTER',
    'PROFESSIONAL',
    'STUDIO',
    'TEAM',
    'BALANCE',
    'NONE'
);

-- Account context for transactions
CREATE TYPE public.account_type AS ENUM (
    'PERSONAL',
    'ORGANIZATION'
);

-- Payment providers for purchases
CREATE TYPE public.payment_provider AS ENUM (
    'STRIPE',
    'LEMONSQUEEZY'
);

-- Plans for purchases
CREATE TYPE public.plans AS ENUM (
    'STARTER',
    'PROFESSIONAL',
    'STUDIO',
    'TEAM'
);

-- Providers for studios
CREATE TYPE public.providers AS ENUM (
    'MODAL'
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TYPE public.invitation_status IS 'Status of organization invitations';
COMMENT ON TYPE public.organization_role IS 'Roles within an organization';
COMMENT ON TYPE public.studio_status IS 'Processing status of studio creation';
COMMENT ON TYPE public.purchase_status IS 'Status of purchase transactions';
COMMENT ON TYPE public.credit_transfer_type IS 'Types of credit transfers between plans';
COMMENT ON TYPE public.account_type IS 'Type of account context.';
COMMENT ON TYPE public.payment_provider IS 'Payment provider used (e.g., stripe, paypal)';
COMMENT ON TYPE public.plans IS 'Plans for purchases';
COMMENT ON TYPE public.providers IS 'Providers for studios';

-- Reset session settings
RESET ALL;
