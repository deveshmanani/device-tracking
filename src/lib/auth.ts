import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Profile } from '@/types';

/**
 * Get the current authenticated user and their profile
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // Clear any invalid session before redirecting
      await supabase.auth.signOut();
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
      await supabase.auth.signOut();
      redirect('/login');
    }

    return { user, profile };
  } catch (error) {
    // Handle any unexpected auth errors
    console.error('Authentication error:', error);
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      // Ignore signOut errors
    }
    redirect('/login');
  }
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
  
  try {
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
  } catch (error) {
    // Silently handle auth errors for optional auth check
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin() {
  const currentUser = await getCurrentUser();
  return currentUser?.profile.role === 'admin';
}
