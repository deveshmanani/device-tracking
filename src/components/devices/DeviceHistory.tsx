'use client';

import { useDeviceEvents } from '@/hooks/useMyDevices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Activity } from 'lucide-react';

interface DeviceHistoryProps {
  deviceId: string;
}

const eventTypeLabels: Record<string, string> = {
  device_created: 'Device Created',
  device_updated: 'Device Updated',
  assigned: 'Assigned',
  returned: 'Returned',
  override_assigned: 'Admin Override Assignment',
  status_changed: 'Status Changed',
};

const eventTypeVariants: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  device_created: 'default',
  device_updated: 'secondary',
  assigned: 'success',
  returned: 'default',
  override_assigned: 'warning',
  status_changed: 'secondary',
};

const DeviceHistory = ({ deviceId }: DeviceHistoryProps) => {
  const { data: events, isLoading, error } = useDeviceEvents(deviceId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Device History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Device History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Failed to load device history: {error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Device History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No history available for this device.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Device History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`flex gap-4 pb-4 ${
                index !== events.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                {index !== events.length - 1 && (
                  <div className="w-px h-full bg-border mt-1" />
                )}
              </div>

              {/* Event content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant={eventTypeVariants[event.event_type] || 'default'}>
                      {eventTypeLabels[event.event_type] || event.event_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {event.actor.full_name || event.actor.email}
                  </span>
                </div>

                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                    {event.metadata.status_change && (
                      <p className="text-muted-foreground">
                        Status: {event.metadata.status_change.from} → {event.metadata.status_change.to}
                      </p>
                    )}
                    {event.metadata.assigned_to && (
                      <p className="text-muted-foreground">
                        Assigned to user
                      </p>
                    )}
                    {event.metadata.returned_by && (
                      <p className="text-muted-foreground">
                        Returned by user
                      </p>
                    )}
                    {event.metadata.admin_override && (
                      <p className="text-warning">
                        Admin override action
                      </p>
                    )}
                    {event.metadata.updated_fields && (
                      <p className="text-muted-foreground">
                        Updated: {event.metadata.updated_fields.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceHistory;
