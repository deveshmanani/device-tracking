import { useQuery } from '@tanstack/react-query';
import { getMyDevices, getDeviceEvents } from '@/server';
import { queryKeys } from '@/lib/query/keys';
import type { MyDeviceAssignment, DeviceEvent } from '@/server/my-devices';

/**
 * Fetch current user's active device assignments
 */
export function useMyDevices() {
  return useQuery<MyDeviceAssignment[], Error>({
    queryKey: queryKeys.myDevices.all,
    queryFn: () => getMyDevices(),
  });
}

/**
 * Fetch device event history
 */
export function useDeviceEvents(deviceId: string) {
  return useQuery<DeviceEvent[], Error>({
    queryKey: ['device-events', deviceId],
    queryFn: () => getDeviceEvents(deviceId),
  });
}
