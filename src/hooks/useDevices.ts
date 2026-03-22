'use client';

import { useQuery } from '@tanstack/react-query';
import { getDevices, getDevicePlatforms, getDeviceBrands, getDeviceById, type DeviceFilters } from '@/server';
import { queryKeys } from '@/lib/query/keys';

/**
 * Hook to fetch devices with filters
 */
export function useDevices(filters: DeviceFilters = {}) {
  return useQuery({
    queryKey: queryKeys.devices.list(filters),
    queryFn: () => getDevices(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single device by ID
 */
export function useDevice(id: string) {
  return useQuery({
    queryKey: queryKeys.devices.detail(id),
    queryFn: () => getDeviceById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch device platforms for filter dropdown
 */
export function useDevicePlatforms() {
  return useQuery({
    queryKey: ['device-platforms'],
    queryFn: () => getDevicePlatforms(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch device brands for filter dropdown
 */
export function useDeviceBrands() {
  return useQuery({
    queryKey: ['device-brands'],
    queryFn: () => getDeviceBrands(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
