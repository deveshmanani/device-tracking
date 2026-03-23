'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { signOut } from '@/server/auth';

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading}
      className="cursor-pointer"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
