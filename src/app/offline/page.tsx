'use client';

import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OfflinePage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-6">
              <WifiOff className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">You're Offline</h1>
            <p className="text-muted-foreground">
              It looks like you've lost your internet connection. Some features may not be available.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Device assignment and return operations require an active internet connection.
            </p>
            
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflinePage;
