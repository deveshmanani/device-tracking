import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { bootstrapProfile } from '@/server/auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Bootstrap profile if this is first login
        await bootstrapProfile(user);
      }
    }
  }

  // Redirect to home page
  return NextResponse.redirect(`${origin}/`);
}
