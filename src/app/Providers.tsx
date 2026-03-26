'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useState, useEffect } from 'react';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import UpdatePrompt from '@/components/pwa/UpdatePrompt';
import { createClient } from '@/lib/supabase/client';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0, // Always consider data stale for instant updates
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Handle auth state changes and errors
  useEffect(() => {
    const supabase = createClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // If there's a token refresh error, redirect to login
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.error('Token refresh failed, redirecting to login');
        window.location.href = '/login';
      }
      
      // If user signed out, redirect to login
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={['light', 'dark']}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <ServiceWorkerRegister />
          <UpdatePrompt />
          <InstallPrompt />
          {children}
        </NuqsAdapter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Providers;
