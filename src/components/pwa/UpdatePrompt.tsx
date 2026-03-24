'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const UpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Check if there's an update waiting
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowPrompt(true);
        }

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed and ready
              setWaitingWorker(newWorker);
              setShowPrompt(true);
              console.log('New version available!');
            }
          });
        });

        // Listen for controller change (service worker activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!isUpdating) {
            // Service worker was updated by another tab/window
            console.log('App was updated by another tab. Reloading...');
            window.location.reload();
          }
        });

      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    checkForUpdates();

    // Check for updates periodically (every 5 minutes)
    const interval = setInterval(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isUpdating]);

  const handleUpdate = () => {
    if (!waitingWorker) return;

    setIsUpdating(true);

    // Tell the waiting service worker to skip waiting and become active
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page to use the new service worker
    // The controllerchange event will trigger the reload
    // But we also set a timeout as a fallback
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal time to avoid being too annoying
    localStorage.setItem('update-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt || !waitingWorker) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-top">
      <Card className="border-2 shadow-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-blue-500/10 rounded-lg p-2">
              <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  Update Available
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  A new version of the app is ready. Update now for the latest features and fixes.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Now'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  disabled={isUpdating}
                  className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePrompt;
