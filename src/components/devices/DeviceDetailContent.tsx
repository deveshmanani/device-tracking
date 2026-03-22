'use client';

import { useDevice } from '@/hooks/useDevices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, User, Package } from 'lucide-react';

interface DeviceDetailContentProps {
  deviceId: string;
}

const DeviceDetailContent = ({ deviceId }: DeviceDetailContentProps) => {
  const { data: device, isLoading, error } = useDevice(deviceId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (error || !device) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading device</AlertTitle>
        <AlertDescription>
          {error?.message || 'Device not found'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/devices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{device.name}</h1>
            <p className="text-muted-foreground">
              {device.brand} {device.model}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={device.status} />
          <Link href={`/devices/${device.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {device.image_url && (
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={device.image_url}
                    alt={device.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Device Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Asset Tag</p>
                  <p className="font-mono text-sm mt-1">{device.asset_tag}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Platform</p>
                  <p className="mt-1">{device.platform}</p>
                </div>
                {device.os_version && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">OS Version</p>
                    <p className="mt-1">{device.os_version}</p>
                  </div>
                )}
                {device.serial_number && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                    <p className="font-mono text-sm mt-1">{device.serial_number}</p>
                  </div>
                )}
                {device.imei && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IMEI</p>
                    <p className="font-mono text-sm mt-1">{device.imei}</p>
                  </div>
                )}
                {device.location_name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="mt-1">{device.location_name}</p>
                  </div>
                )}
              </div>

              {device.condition_note && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Condition Notes</p>
                  <p className="text-sm">{device.condition_note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Assignment */}
          {device.current_holder && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Current Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {device.current_holder.full_name || device.current_holder.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{device.current_holder.email}</p>
                  </div>
                  <Badge variant="default">Assigned</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">QR Code Coming Soon</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center font-mono">
                {device.qr_code_value}
              </p>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm mt-1">
                  {new Date(device.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {device.creator && (
                  <p className="text-xs text-muted-foreground">
                    by {device.creator.full_name || device.creator.email}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm mt-1">
                  {new Date(device.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="default" disabled>
                Assign Device
              </Button>
              <Button className="w-full" variant="outline" disabled>
                View History
              </Button>
              <Button className="w-full" variant="outline" disabled>
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailContent;
