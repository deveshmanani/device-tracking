'use client';

import { useMyDevices } from '@/hooks/useMyDevices';
import { returnDevice } from '@/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatusBadge from '@/components/shared/StatusBadge';
import { NoMyDevicesFound, ErrorState } from '@/components/shared/EmptyStates';
import Link from 'next/link';
import { Package, Calendar, ArrowRight, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MyDevicesList = () => {
  const { data: assignments, isLoading, error } = useMyDevices();
  const queryClient = useQueryClient();
  const [returningDeviceId, setReturningDeviceId] = useState<string | null>(null);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deviceToReturn, setDeviceToReturn] = useState<{ id: string; name: string } | null>(null);

  const openReturnDialog = (deviceId: string, deviceName: string) => {
    setDeviceToReturn({ id: deviceId, name: deviceName });
    setConfirmDialogOpen(true);
    setReturnError(null);
  };

  const handleReturn = async () => {
    if (!deviceToReturn) return;

    setReturningDeviceId(deviceToReturn.id);
    setReturnError(null);

    try {
      const result = await returnDevice(deviceToReturn.id);
      
      if (result.success) {
        // Invalidate queries to refresh data immediately
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.myDevices.all,
          refetchType: 'active'
        });
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.devices.all,
          refetchType: 'active'
        });
        
        // Close dialog on success
        setConfirmDialogOpen(false);
        setDeviceToReturn(null);
      } else {
        setReturnError(result.message);
      }
    } catch (err: any) {
      setReturnError(err.message || 'Failed to return device');
    } finally {
      setReturningDeviceId(null);
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load your devices"
        description={error.message || 'An unexpected error occurred while loading your devices.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (!assignments || assignments.length === 0) {
    return <NoMyDevicesFound />;
  }

  return (
    <div className="space-y-4">
      {returnError && (
        <Alert variant="destructive">
          <AlertDescription>{returnError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    {assignment.device.name}
                  </CardTitle>
                  <StatusBadge status={assignment.device.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="font-mono">{assignment.device.asset_tag}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">
                  {assignment.device.brand} {assignment.device.model}
                </p>
                {assignment.device.platform && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {assignment.device.platform}
                    {assignment.device.os_version && ` ${assignment.device.os_version}`}
                  </p>
                )}
              </div>

              {assignment.purpose && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">Purpose:</p>
                  <p className="text-muted-foreground">{assignment.purpose}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => openReturnDialog(assignment.device.id, assignment.device.name)}
                  disabled={returningDeviceId === assignment.device.id}
                  className="flex-1"
                >
                  {returningDeviceId === assignment.device.id ? 'Returning...' : 'Return Device'}
                </Button>
                <Link href={`/devices/${assignment.device.id}`}>
                  <Button variant="outline" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Return Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Return Device
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to return <strong>{deviceToReturn?.name}</strong>?
              {' '}This action will mark the device as available for others to use.
            </DialogDescription>
          </DialogHeader>

          {returnError && (
            <Alert variant="destructive">
              <AlertDescription>{returnError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false);
                setDeviceToReturn(null);
                setReturnError(null);
              }}
              disabled={returningDeviceId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleReturn}
              disabled={returningDeviceId !== null}
              className="cursor-pointer"
            >
              {returningDeviceId ? 'Returning...' : 'Yes, Return Device'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyDevicesList;
