import { z } from 'zod';

const envSchema = z.object({
  // Supabase - Public
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default('https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default('placeholder-anon-key'),
  
  // App - Public
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').default('http://localhost:3000'),
  
  // Supabase - Server only
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default('placeholder-service-role-key'),
});

const clientEnvSchema = envSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_APP_URL: true,
});

function validateEnv() {
  const parsed = envSchema.parse(process.env);
  
  // Warn if using placeholder values (except during build)
  if (process.env.NODE_ENV !== 'production' && parsed.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('⚠️  Warning: Using placeholder Supabase URL. Update .env.local with your actual Supabase credentials.');
  }
  
  return parsed;
}

function validateClientEnv() {
  const parsed = clientEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  
  return parsed;
}

// Server-side env (includes all variables)
export const env = validateEnv();

// Client-side env (only NEXT_PUBLIC_ variables)
export const clientEnv = validateClientEnv();

// Type-safe access
export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
