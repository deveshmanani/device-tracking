// TanStack Query key factory for consistent cache keys
export const queryKeys = {
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    recentDevices: () => [...queryKeys.dashboard.all, 'recent-devices'] as const,
  },
  
  // Devices
  devices: {
    all: ['devices'] as const,
    lists: () => [...queryKeys.devices.all, 'list'] as const,
    list: (filters: any) => 
      [...queryKeys.devices.lists(), filters] as const,
    details: () => [...queryKeys.devices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.devices.details(), id] as const,
  },
  
  // Assignments
  assignments: {
    all: ['assignments'] as const,
    user: (userId: string) => [...queryKeys.assignments.all, 'user', userId] as const,
    device: (deviceId: string) => [...queryKeys.assignments.all, 'device', deviceId] as const,
  },
  
  // Events
  events: {
    all: ['events'] as const,
    device: (deviceId: string) => [...queryKeys.events.all, 'device', deviceId] as const,
  },
  
  // My Devices
  myDevices: {
    all: ['my-devices'] as const,
  },
};
