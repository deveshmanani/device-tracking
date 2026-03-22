'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRecentDevices } from '@/server';
import { queryKeys } from '@/lib/query/keys';

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch recently updated devices
 */
export function useRecentDevices(limit = 10) {
  return useQuery({
    queryKey: queryKeys.dashboard.recentDevices(),
    queryFn: () => getRecentDevices(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
