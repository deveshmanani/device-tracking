import 'server-only';
import { env } from './env';

/**
 * Server-only environment variables.
 * This file ensures the service role key is never exposed to the client.
 * Import this file only in server-side code (Server Components, Server Actions, Route Handlers).
 */
export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
} as const;
