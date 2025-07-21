-- ============================================================================
-- HELPER FUNCTIONS
-- DESCRIPTION: General utility functions used across the application
-- DEPENDENCIES: None (foundational utilities)
-- BREAKING CHANGES: None
-- ROLLBACK: DROP FUNCTION statements for each function
-- ============================================================================

-- ============================================================================
-- FUNCTION: generate_random_token
-- DESCRIPTION: Generate a secure random token for invitations, etc.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_random_token(token_length INTEGER DEFAULT 32)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    -- Generate random token using pgcrypto
    RETURN encode(gen_random_bytes(token_length), 'hex');
END;
$$;

-- ============================================================================
-- FUNCTION: is_valid_email
-- DESCRIPTION: Validate email format
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_valid_email(email_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    IF email_address IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Basic email validation regex
    RETURN email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- ============================================================================
-- FUNCTION: is_valid_url
-- DESCRIPTION: Validate URL format
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_valid_url(url_string TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    IF url_string IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Basic URL validation regex
    RETURN url_string ~* '^https?://[^\s/$.?#].[^\s]*$';
END;
$$;

-- ============================================================================
-- FUNCTION: slugify
-- DESCRIPTION: Convert text to URL-friendly slug
-- ============================================================================

CREATE OR REPLACE FUNCTION public.slugify(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Convert to lowercase, replace spaces and special chars with hyphens
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(input_text),
                '[^a-zA-Z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$;

-- ============================================================================
-- FUNCTION: calculate_percentage
-- DESCRIPTION: Calculate percentage with proper rounding
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_percentage(
    part_value NUMERIC,
    total_value NUMERIC,
    decimal_places INTEGER DEFAULT 2
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
BEGIN
    IF total_value = 0 OR total_value IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((part_value / total_value) * 100, decimal_places);
END;
$$;

-- ============================================================================
-- FUNCTION: format_file_size
-- DESCRIPTION: Format bytes into human-readable file size
-- ============================================================================

CREATE OR REPLACE FUNCTION public.format_file_size(bytes_size BIGINT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    units TEXT[] := ARRAY['B', 'KB', 'MB', 'GB', 'TB'];
    size_value NUMERIC := bytes_size;
    unit_index INTEGER := 1;
BEGIN
    IF bytes_size IS NULL OR bytes_size < 0 THEN
        RETURN '0 B';
    END IF;
    
    WHILE size_value >= 1024 AND unit_index < array_length(units, 1) LOOP
        size_value := size_value / 1024.0;
        unit_index := unit_index + 1;
    END LOOP;
    
    IF unit_index = 1 THEN
        RETURN size_value || ' ' || units[unit_index];
    ELSE
        RETURN ROUND(size_value, 2) || ' ' || units[unit_index];
    END IF;
END;
$$;

-- ============================================================================
-- FUNCTION: get_time_ago
-- DESCRIPTION: Get human-readable time difference
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_time_ago(input_timestamp TIMESTAMPTZ)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    time_diff INTERVAL;
    total_seconds INTEGER;
    days INTEGER;
    hours INTEGER;
    minutes INTEGER;
BEGIN
    IF input_timestamp IS NULL THEN
        RETURN 'Unknown';
    END IF;
    
    time_diff := NOW() - input_timestamp;
    total_seconds := EXTRACT(EPOCH FROM time_diff)::INTEGER;
    
    IF total_seconds < 0 THEN
        RETURN 'In the future';
    END IF;
    
    days := total_seconds / 86400;
    hours := (total_seconds % 86400) / 3600;
    minutes := (total_seconds % 3600) / 60;
    
    IF days > 0 THEN
        RETURN days || CASE WHEN days = 1 THEN ' day ago' ELSE ' days ago' END;
    ELSIF hours > 0 THEN
        RETURN hours || CASE WHEN hours = 1 THEN ' hour ago' ELSE ' hours ago' END;
    ELSIF minutes > 0 THEN
        RETURN minutes || CASE WHEN minutes = 1 THEN ' minute ago' ELSE ' minutes ago' END;
    ELSE
        RETURN 'Just now';
    END IF;
END;
$$;

-- ============================================================================
-- FUNCTION: clean_jsonb
-- DESCRIPTION: Remove null values from JSONB object
-- ============================================================================

CREATE OR REPLACE FUNCTION public.clean_jsonb(input_jsonb JSONB)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    key TEXT;
    result JSONB := '{}'::JSONB;
BEGIN
    IF input_jsonb IS NULL THEN
        RETURN NULL;
    END IF;
    
    FOR key IN SELECT jsonb_object_keys(input_jsonb) LOOP
        IF input_jsonb -> key IS NOT NULL AND input_jsonb ->> key != 'null' THEN
            result := result || jsonb_build_object(key, input_jsonb -> key);
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$;

-- ============================================================================
-- FUNCTION: safe_divide
-- DESCRIPTION: Division with zero-check
-- ============================================================================

CREATE OR REPLACE FUNCTION public.safe_divide(
    numerator NUMERIC,
    denominator NUMERIC,
    default_value NUMERIC DEFAULT 0
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
BEGIN
    IF denominator = 0 OR denominator IS NULL THEN
        RETURN default_value;
    END IF;
    
    RETURN numerator / denominator;
END;
$$;

-- ============================================================================
-- FUNCTION OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER FUNCTION public.generate_random_token(INTEGER) OWNER TO postgres;
ALTER FUNCTION public.is_valid_email(TEXT) OWNER TO postgres;
ALTER FUNCTION public.is_valid_url(TEXT) OWNER TO postgres;
ALTER FUNCTION public.slugify(TEXT) OWNER TO postgres;
ALTER FUNCTION public.calculate_percentage(NUMERIC, NUMERIC, INTEGER) OWNER TO postgres;
ALTER FUNCTION public.format_file_size(BIGINT) OWNER TO postgres;
ALTER FUNCTION public.get_time_ago(TIMESTAMPTZ) OWNER TO postgres;
ALTER FUNCTION public.clean_jsonb(JSONB) OWNER TO postgres;
ALTER FUNCTION public.safe_divide(NUMERIC, NUMERIC, NUMERIC) OWNER TO postgres;

COMMENT ON FUNCTION public.generate_random_token(INTEGER) IS 
    'Generate a secure random token for invitations and other purposes';

COMMENT ON FUNCTION public.is_valid_email(TEXT) IS 
    'Validate email address format using regex';

COMMENT ON FUNCTION public.is_valid_url(TEXT) IS 
    'Validate URL format using regex';

COMMENT ON FUNCTION public.slugify(TEXT) IS 
    'Convert text to URL-friendly slug format';

COMMENT ON FUNCTION public.calculate_percentage(NUMERIC, NUMERIC, INTEGER) IS 
    'Calculate percentage with proper rounding and zero-division handling';

COMMENT ON FUNCTION public.format_file_size(BIGINT) IS 
    'Format bytes into human-readable file size (B, KB, MB, GB, TB)';

COMMENT ON FUNCTION public.get_time_ago(TIMESTAMPTZ) IS 
    'Get human-readable time difference (e.g., "2 hours ago")';

COMMENT ON FUNCTION public.clean_jsonb(JSONB) IS 
    'Remove null values from JSONB object';

COMMENT ON FUNCTION public.safe_divide(NUMERIC, NUMERIC, NUMERIC) IS 
    'Division with zero-check and default value';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permissions to all roles for utility functions
GRANT EXECUTE ON FUNCTION public.generate_random_token(INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_valid_email(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_valid_url(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.slugify(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_percentage(NUMERIC, NUMERIC, INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.format_file_size(BIGINT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_time_ago(TIMESTAMPTZ) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.clean_jsonb(JSONB) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.safe_divide(NUMERIC, NUMERIC, NUMERIC) TO anon, authenticated, service_role;
