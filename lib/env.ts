import { z } from "zod";

// =============================================================================
// PUBLIC ENVIRONMENT VARIABLES (SAFE FOR CLIENT-SIDE USAGE)
// =============================================================================
const publicSchema = z.object({
  // SUPABASE PUBLIC KEYS
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

  // APP URL
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // R2 CLOUDFLARE STORAGE
  NEXT_PUBLIC_R2_DATASETS_BUCKET_NAME: z.string().min(1).optional(),
  NEXT_PUBLIC_R2_DATASETS_CUSTOM_DOMAIN: z.string().min(1).optional(),

  // ENVIRONMENT
  NEXT_PUBLIC_NODE_ENV: z
    .enum(["development", "test", "production"])
    .optional(),
});

// =============================================================================
// SERVER-ONLY ENVIRONMENT VARIABLES (NEVER EXPOSED TO CLIENT)
// =============================================================================
const serverSchema = z.object({
  // GENERAL
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  URL: z.string().url().optional(),

  // SUPABASE
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_WEBHOOK_SECRET: z.string().min(1).optional(),

  // EMAIL (ZEPTOMAIL)
  ZEPTOMAIL_API_URL: z.string().optional(),
  ZEPTOMAIL_SENDMAIL_TOKEN: z.string().min(1).optional(),

  // BILLING / AFFILIATES
  WEBHOOK_SECRET: z.string().min(1).optional(),
  LEMONSQUEEZY_API_KEY: z.string().min(1).optional(),
  LEMONSQUEEZY_STORE_ID: z.string().min(1).optional(),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().min(1).optional(),
  FIRSTPROMOTER_API_KEY: z.string().min(1).optional(),

  // CLOUDFLARE R2
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_ENDPOINT: z.string().url().optional(),
  R2_PUBLIC_URL: z.string().min(1).optional(),

  // MODAL (AI TRAINING)
  MODAL_KEY: z.string().min(1).optional(),
  MODAL_SECRET: z.string().min(1).optional(),
  MODAL_COMFYUI_STANDARD_ENDPOINT: z.string().min(1).optional(),
  MODAL_COMFYUI_STANDARD_ENDPOINT_V2: z.string().url().optional(),
  MODAL_TRAINING_ENDPOINT: z.string().url().optional(),
  MODAL_TRAINING_ENDPOINT_V2: z.string().url().optional(),

  // FAL.AI (AI IMAGE EDITING)
  FAL_KEY: z.string().min(1).optional(),

  // INTERCOM
  INTERCOM_MESSENGER_SECRET: z.string().min(1).optional(),

  // BUILD-TIME ONLY (NOT RUNTIME)
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
});

const publicParse = publicSchema.safeParse(process.env);
if (!publicParse.success) {
  // Only throw if a required public variable is missing; optional ones can be undefined
  const message = publicParse.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  throw new Error(`Invalid public environment variables: ${message}`);
}

const serverParse = serverSchema.safeParse(process.env);
if (!serverParse.success) {
  const message = serverParse.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  throw new Error(`Invalid server environment variables: ${message}`);
}

export const publicEnv = publicParse.data;
export const env = serverParse.data;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// HELPER TO GET BASE URL CONSISTENTLY
export const getBaseUrlFromEnv = (): string => {
  // In production, prioritize custom domain over Vercel's auto-generated URL
  if (publicEnv.NEXT_PUBLIC_APP_URL) return publicEnv.NEXT_PUBLIC_APP_URL;
  if (env.URL) return env.URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};
