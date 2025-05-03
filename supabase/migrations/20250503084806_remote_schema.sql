

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."add_new_studio"("user_id" "text", "new_studio" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.users  -- Qualify the table name with the schema
  SET studios = new_studio || studios
  WHERE id = user_id::uuid;
END;
$$;


ALTER FUNCTION "public"."add_new_studio"("user_id" "text", "new_studio" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_purchase_history"("user_id" "text", "transaction_data" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE users
  SET purchase_history = purchase_history || transaction_data
  WHERE id = user_id::uuid;
END;
$$;


ALTER FUNCTION "public"."add_purchase_history"("user_id" "text", "transaction_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."append_preview_image_urls"("tune_id" "text", "image_urls" "text"[], "user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE users
    SET preview = jsonb_set(
        preview,
        ARRAY[tune_id],
        (COALESCE(preview -> tune_id, '[]'::jsonb) || to_jsonb(image_urls))::jsonb,
        true
    )
    WHERE id = user_id;
END;
$$;


ALTER FUNCTION "public"."append_preview_image_urls"("tune_id" "text", "image_urls" "text"[], "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."append_results_image_urls"("tune_id" "text", "image_urls" "text"[], "user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE users
    SET results = jsonb_set(
        results,
        ARRAY[tune_id],
        (COALESCE(results -> tune_id, '[]'::jsonb) || to_jsonb(image_urls))::jsonb,
        true
    )
    WHERE id = user_id;
END;
$$;


ALTER FUNCTION "public"."append_results_image_urls"("tune_id" "text", "image_urls" "text"[], "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.users (id, email, full_name, avatar)
  values (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'picture', NULL)
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_downloaded_value"("tune_id" integer, "user_id" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE users
  SET studios = jsonb_set(studios, concat((SELECT index FROM jsonb_array_elements(studios) WITH ORDINALITY WHERE (value->>'id')::integer = tune_id), '/downloaded'), 'true')
  WHERE id = user_id::uuid;
END;
$$;


ALTER FUNCTION "public"."update_downloaded_value"("tune_id" integer, "user_id" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "avatar" "text",
    "email" "text" NOT NULL,
    "preview" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "results" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "studios" "jsonb"[] DEFAULT '{}'::"jsonb"[] NOT NULL,
    "credits" "jsonb" DEFAULT '{"Pro": 0, "Basic": 0, "Premium": 0, "Standard": 0}'::"jsonb" NOT NULL,
    "purchase_history" "jsonb"[] DEFAULT '{}'::"jsonb"[] NOT NULL,
    "metadata" "jsonb" DEFAULT '{"f_name": null, "l_name": null, "company": null, "website": null, "position": null, "x_username": null, "linkedin_username": null, "instagram_username": null}'::"jsonb" NOT NULL,
    "full_name" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Public Users table';



COMMENT ON COLUMN "public"."users"."preview" IS 'Store Watermarked Images';



COMMENT ON COLUMN "public"."users"."results" IS 'Show customers real generated image without watermark.';



COMMENT ON COLUMN "public"."users"."studios" IS 'List of all the studios created by user.';



COMMENT ON COLUMN "public"."users"."credits" IS 'show remaining user credits.';



COMMENT ON COLUMN "public"."users"."purchase_history" IS 'show purchase history';



COMMENT ON COLUMN "public"."users"."metadata" IS 'user metadata';



COMMENT ON COLUMN "public"."users"."full_name" IS 'Full name of the user.';



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can insert their own profile." ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile." ON "public"."users" FOR UPDATE USING (true) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own profile." ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


























































































































































































GRANT ALL ON FUNCTION "public"."add_new_studio"("user_id" "text", "new_studio" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."add_new_studio"("user_id" "text", "new_studio" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_new_studio"("user_id" "text", "new_studio" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_purchase_history"("user_id" "text", "transaction_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."add_purchase_history"("user_id" "text", "transaction_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_purchase_history"("user_id" "text", "transaction_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."append_preview_image_urls"("tune_id" "text", "image_urls" "text"[], "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."append_preview_image_urls"("tune_id" "text", "image_urls" "text"[], "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."append_preview_image_urls"("tune_id" "text", "image_urls" "text"[], "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."append_results_image_urls"("tune_id" "text", "image_urls" "text"[], "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."append_results_image_urls"("tune_id" "text", "image_urls" "text"[], "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."append_results_image_urls"("tune_id" "text", "image_urls" "text"[], "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_downloaded_value"("tune_id" integer, "user_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_downloaded_value"("tune_id" integer, "user_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_downloaded_value"("tune_id" integer, "user_id" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
