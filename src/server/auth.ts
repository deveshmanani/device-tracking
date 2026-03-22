'use server';

import { createAdminClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Bootstrap a user profile on first login
 * Creates a profile record with default 'user' role
 */
export async function bootstrapProfile(user: User) {
  const supabase = createAdminClient();

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  // Profile already exists, nothing to do
  if (existingProfile) {
    return existingProfile;
  }

  // Create new profile
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      role: 'user', // Default role
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw new Error('Failed to create user profile');
  }

  return newProfile;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  
  await supabase.auth.signOut();
  
  const { redirect } = await import('next/navigation');
  redirect('/login');
}
