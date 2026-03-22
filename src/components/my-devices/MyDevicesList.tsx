'use client';

import { useMyDevices } from '@/hooks/useMyDevices';
import { returnDevice } from '@/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatusBadge from '@/components/shared/StatusBadge';
import Link from 'next/link';
import { Package, Calendar, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';

const MyDevicesList = () => {
  const { data: assignments, isLoading, error } = useMyDevices();
  const queryClient = useQueryClient();
  const [returningDeviceId, setReturningDeviceId] = useState<string | null>(null);
  const [returnError, setReturnError] = useState<string | null>(null);

  const handleReturn = async (deviceId: string, deviceName: string) => {
    if (!confirm(`Are you sure you want to return ${deviceName}?`)) {
      return;
    }

    setReturningDeviceId(deviceId);
    setReturnError(null);

    try {
      const result = await returnDevice(deviceId);
      
      if (result.success) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: queryKeys.myDevices.all });
        queryClient.invalidateQueries({ queryKey: ['devices'] });
      } else {
        setReturnError(result.message);
      }
    } catch (err: any) {
      setReturnError(err.message || 'Failed to return device');
    } finally {
      setReturningDeviceId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load your devices: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Devices Assigned</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any devices assigned to you at the moment.
            </p>
            <Link href="/scan">
              <Button>Scan QR to Assign Device</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
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
                  onClick={() => handleReturn(assignment.device.id, assignment.device.name)}
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
    </div>
  );
};

export default MyDevicesList;
