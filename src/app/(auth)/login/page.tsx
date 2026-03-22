import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginButton from './LoginButton';

const LoginPage = async () => {
  const supabase = await createClient();
  
  // Check if already authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect('/');
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
