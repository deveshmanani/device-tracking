import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginButton from './LoginButton';

const LoginPage = async () => {
  const supabase = await createClient();
  
  // Check if already authenticated
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // If user is authenticated, redirect to home
    if (user && !error) {
      redirect('/');
    }
    
    // If there's an auth error (invalid token), clear the session
    if (error) {
      await supabase.auth.signOut();
    }
  } catch (error) {
    // If there's any error checking auth, just continue to login page
    console.error('Auth check error on login page:', error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Device Tracking
            </h1>
            <p className="text-muted-foreground">
              Sign in to manage your devices
            </p>
          </div>

          <LoginButton />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Internal use only. Sign in with your organization Google account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
