import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Profile } from '@/types';

/**
 * Get the current authenticated user and their profile
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/login');
  }

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // Profile doesn't exist (shouldn't happen after bootstrap)
    console.error('Profile not found for authenticated user:', user.id);
    redirect('/login');
  }

  return { user, profile };
}

/**
 * Require admin role
 * Redirects to home if not admin
 */
export async function requireAdmin() {
  const { user, profile } = await requireAuth();

  if (profile.role !== 'admin') {
    redirect('/');
  }

  return { user, profile: profile as Profile & { role: 'admin' } };
}

/**
 * Get current user if authenticated (doesn't redirect)
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return null;
  }

  return { user, profile };
}

/**
 * Check if current user is admin
 */
export async function isAdmin() {
  const currentUser = await getCurrentUser();
  return currentUser?.profile.role === 'admin';
}
