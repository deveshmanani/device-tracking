'use client';

import Link from 'next/link';
import { useDashboardStats, useRecentDevices } from '@/hooks/useDashboard';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DashboardContent = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentDevices, isLoading: devicesLoading, error: devicesError } = useRecentDevices(8);

  if (statsError || devicesError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading dashboard</AlertTitle>
        <AlertDescription>
          {statsError?.message || devicesError?.message || 'An unexpected error occurred'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Device Overview</h2>
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Loading size="sm" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Devices" value={stats.total} variant="primary" />
            <StatCard title="Available" value={stats.available} variant="success" />
            <StatCard title="Checked Out" value={stats.checked_out} variant="default" />
            <StatCard title="In Repair" value={stats.in_repair} variant="warning" />
            <StatCard title="Retired" value={stats.retired} variant="default" />
            <StatCard title="Lost" value={stats.lost} variant="destructive" />
          </div>
        ) : null}
      </div>

      {/* Recent Devices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recently Updated</h2>
          <Link 
            href="/devices" 
            className="text-sm text-primary hover:underline"
          >
            View all devices →
          </Link>
        </div>

        {devicesLoading ? (
          <Card>
            <CardContent className="p-6">
              <Loading />
            </CardContent>
          </Card>
        ) : recentDevices && recentDevices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDevices.map((device) => (
              <Link key={device.id} href={`/devices/${device.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    {device.image_url && (
                      <div className="aspect-video rounded-md overflow-hidden mb-3 bg-muted">
                        <img
                          src={device.image_url}
                          alt={device.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-1">
                        {device.name}
                      </CardTitle>
                      <StatusBadge status={device.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        {device.brand} {device.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {device.asset_tag}
                      </p>
                      {device.current_holder && (
                        <p className="text-xs text-primary">
                          Holder: {device.current_holder.full_name || device.current_holder.email}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No devices found. Add some devices to get started.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
