-- ============================================================================
-- STUDIO FUNCTIONS
-- DESCRIPTION: Helper functions for studio management and operations
-- DEPENDENCIES: studios table, headshots table, credits table
-- BREAKING CHANGES: Updated functions to work with merged headshots table
-- ROLLBACK: DROP FUNCTION statements for each function
-- ============================================================================

-- ============================================================================
-- FUNCTION: update_downloaded_value
-- DESCRIPTION: Mark a studio as downloaded by tune_id
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_downloaded_value(
    p_tune_id INTEGER,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    UPDATE public.studios
    SET downloaded = TRUE,
        updated_at = NOW()
    WHERE tune_id = p_tune_id
    AND creator_user_id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Studio with tune_id % not found for user %', p_tune_id, p_user_id;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error updating downloaded value for tune_id % and user %: %', p_tune_id, p_user_id, SQLERRM;
        RAISE;
END;
$$;

-- ============================================================================
-- FUNCTION: append_preview_image_urls
-- DESCRIPTION: Add preview image URLs to a studio
-- ============================================================================

CREATE OR REPLACE FUNCTION public.append_preview_image_urls(
    p_studio_id UUID,
    p_image_urls TEXT[],
    p_prompts TEXT[] DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    i INTEGER;
    url TEXT;
    prompt TEXT;
BEGIN
    -- Validate studio exists and user has access
    IF NOT EXISTS (
        SELECT 1 FROM public.studios 
        WHERE id = p_studio_id 
        AND creator_user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Studio not found or access denied';
    END IF;
    
    -- Insert preview images into headshots table
    FOR i IN 1..array_length(p_image_urls, 1) LOOP
        url := p_image_urls[i];
        prompt := CASE 
            WHEN p_prompts IS NOT NULL AND i <= array_length(p_prompts, 1) 
            THEN p_prompts[i] 
            ELSE NULL 
        END;
        
        INSERT INTO public.headshots (studio_id, preview, prompt)
        VALUES (p_studio_id, url, prompt);
    END LOOP;
    
    -- Update studio status if still pending
    UPDATE public.studios
    SET status = 'PROCESSING',
        updated_at = NOW()
    WHERE id = p_studio_id
    AND status = 'PENDING';
    
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error appending preview images for studio %: %', p_studio_id, SQLERRM;
        RAISE;
END;
$$;

-- ============================================================================
-- FUNCTION: append_results_image_urls
-- DESCRIPTION: Add result image URLs to a studio
-- ============================================================================

CREATE OR REPLACE FUNCTION public.append_results_image_urls(
    p_studio_id UUID,
    p_image_urls TEXT[],
    p_prompts TEXT[] DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    i INTEGER;
    url TEXT;
    prompt TEXT;
    headshot_record RECORD;
    headshots_cursor CURSOR FOR 
        SELECT id, prompt as existing_prompt 
        FROM public.headshots 
        WHERE studio_id = p_studio_id 
        AND preview IS NOT NULL 
        AND result IS NULL
        ORDER BY created_at;
BEGIN
    -- Validate studio exists and user has access
    IF NOT EXISTS (
        SELECT 1 FROM public.studios 
        WHERE id = p_studio_id 
        AND creator_user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Studio not found or access denied';
    END IF;
    
    -- Update existing headshot records with result images
    i := 1;
    FOR headshot_record IN headshots_cursor LOOP
        EXIT WHEN i > array_length(p_image_urls, 1);
        
        url := p_image_urls[i];
        prompt := CASE 
            WHEN p_prompts IS NOT NULL AND i <= array_length(p_prompts, 1) 
            THEN p_prompts[i] 
            ELSE headshot_record.existing_prompt -- Keep existing prompt if no new one provided
        END;
        
        UPDATE public.headshots 
        SET result = url,
            prompt = prompt,
            created_at = NOW() -- Update timestamp when result is added
        WHERE id = headshot_record.id;
        
        i := i + 1;
    END LOOP;
    
    -- If there are more result images than preview records, create new records
    WHILE i <= array_length(p_image_urls, 1) LOOP
        url := p_image_urls[i];
        prompt := CASE 
            WHEN p_prompts IS NOT NULL AND i <= array_length(p_prompts, 1) 
            THEN p_prompts[i] 
            ELSE NULL 
        END;
        
        INSERT INTO public.headshots (studio_id, result, prompt)
        VALUES (p_studio_id, url, prompt);
        
        i := i + 1;
    END LOOP;
    
    -- Update studio status to completed
    UPDATE public.studios
    SET status = 'COMPLETED',
        processing_completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_studio_id;
    
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error appending result images for studio %: %', p_studio_id, SQLERRM;
        RAISE;
END;
$$;

-- ============================================================================
-- FUNCTION: get_user_studios
-- DESCRIPTION: Get studios for a user with optional filtering
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_studios(
    p_user_id UUID DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL,
    p_status public.studio_status DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    status public.studio_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    downloaded BOOLEAN,
    preview_count BIGINT,
    result_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Use provided user_id or current authenticated user
    target_user_id := COALESCE(p_user_id, auth.uid());
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;
    
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.status,
        s.created_at,
        s.updated_at,
        s.downloaded,
        COALESCE(h.preview_count, 0) as preview_count,
        COALESCE(h.result_count, 0) as result_count
    FROM public.studios s
    LEFT JOIN (
        SELECT 
            studio_id, 
            COUNT(*) FILTER (WHERE preview IS NOT NULL) as preview_count,
            COUNT(*) FILTER (WHERE result IS NOT NULL) as result_count
        FROM public.headshots
        GROUP BY studio_id
    ) h ON s.id = h.studio_id
    WHERE s.creator_user_id = target_user_id
    AND (p_organization_id IS NULL OR s.organization_id = p_organization_id)
    AND (p_status IS NULL OR s.status = p_status)
    ORDER BY s.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
    
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error getting user studios: %', SQLERRM;
        RAISE;
END;
$$;

-- ============================================================================
-- FUNCTION: create_studio_with_credits
-- DESCRIPTION: Create a new studio and deduct credits atomically
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_studio_with_credits(
    p_studio_data JSONB,
    p_credit_plan TEXT,
    p_credits_required INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_studio_id UUID;
    v_user_id UUID;
    v_organization_id UUID;
    v_column_name TEXT;
    v_current_credits INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    v_organization_id := (p_studio_data ->> 'organization_id')::UUID;
    
    -- Validate credit plan
    CASE LOWER(p_credit_plan)
        WHEN 'starter' THEN v_column_name := 'starter';
        WHEN 'professional' THEN v_column_name := 'professional';
        WHEN 'studio' THEN v_column_name := 'studio';
        WHEN 'balance' THEN v_column_name := 'balance';
        ELSE
            RAISE EXCEPTION 'Invalid credit plan: %', p_credit_plan;
    END CASE;
    
    -- Begin atomic transaction
    BEGIN
        -- Check and deduct credits
        EXECUTE format('
            UPDATE public.credits 
            SET %I = %I - $1, updated_at = NOW() 
            WHERE user_id = $2 
            AND organization_id IS NULL 
            AND %I >= $1
            RETURNING %I', 
            v_column_name, v_column_name, v_column_name, v_column_name
        ) USING p_credits_required, v_user_id INTO v_current_credits;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient % credits. Required: %', p_credit_plan, p_credits_required;
        END IF;
        
        -- Create studio
        INSERT INTO public.studios (
            creator_user_id,
            organization_id,
            name,
            style_pairs,
            user_attributes,
            prompts_generated,
            total_cost,
            credits_used
        )
        VALUES (
            v_user_id,
            v_organization_id,
            p_studio_data ->> 'name',
            COALESCE(p_studio_data -> 'style_pairs', '[]'::JSONB),
            COALESCE(p_studio_data -> 'user_attributes', '{}'::JSONB),
            COALESCE(
                ARRAY(SELECT jsonb_array_elements_text(p_studio_data -> 'prompts_generated')),
                '{}'::TEXT[]
            ),
            (p_studio_data ->> 'total_cost')::DECIMAL,
            jsonb_build_object(p_credit_plan, p_credits_required)
        )
        RETURNING id INTO v_studio_id;
        
        RETURN v_studio_id;
        
    EXCEPTION
        WHEN others THEN
            RAISE WARNING 'Error creating studio with credits: %', SQLERRM;
            RAISE;
    END;
END;
$$;

-- ============================================================================
-- FUNCTION OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER FUNCTION public.update_downloaded_value(INTEGER, UUID) OWNER TO postgres;
ALTER FUNCTION public.append_preview_image_urls(UUID, TEXT[], TEXT[]) OWNER TO postgres;
ALTER FUNCTION public.append_results_image_urls(UUID, TEXT[], TEXT[]) OWNER TO postgres;
ALTER FUNCTION public.get_user_studios(UUID, UUID, public.studio_status, INTEGER, INTEGER) OWNER TO postgres;
ALTER FUNCTION public.create_studio_with_credits(JSONB, TEXT, INTEGER) OWNER TO postgres;

COMMENT ON FUNCTION public.update_downloaded_value(INTEGER, UUID) IS 
    'Mark a studio as downloaded by tune_id for a specific user';

COMMENT ON FUNCTION public.append_preview_image_urls(UUID, TEXT[], TEXT[]) IS 
    'Add preview image URLs to a studio with optional prompts';

COMMENT ON FUNCTION public.append_results_image_urls(UUID, TEXT[], TEXT[]) IS 
    'Add result image URLs to a studio and mark as completed';

COMMENT ON FUNCTION public.get_user_studios(UUID, UUID, public.studio_status, INTEGER, INTEGER) IS 
    'Get studios for a user with optional filtering and pagination';

COMMENT ON FUNCTION public.create_studio_with_credits(JSONB, TEXT, INTEGER) IS 
    'Create a new studio and deduct credits atomically';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.update_downloaded_value(INTEGER, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.append_preview_image_urls(UUID, TEXT[], TEXT[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.append_results_image_urls(UUID, TEXT[], TEXT[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_studios(UUID, UUID, public.studio_status, INTEGER, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_studio_with_credits(JSONB, TEXT, INTEGER) TO authenticated, service_role;
