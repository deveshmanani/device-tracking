'use client';

import { useQuery } from '@tanstack/react-query';
import { getDevices, getDevicePlatforms, getDeviceBrands, getDeviceCategories, getDeviceById, type DeviceFilters } from '@/server';
import { queryKeys } from '@/lib/query/keys';

/**
 * Hook to fetch devices with filters
 */
export function useDevices(filters: DeviceFilters = {}) {
  return useQuery({
    queryKey: queryKeys.devices.list(filters),
    queryFn: () => getDevices(filters),
  });
}

/**
 * Hook to fetch a single device by ID
 */
export function useDevice(id: string) {
  return useQuery({
    queryKey: queryKeys.devices.detail(id),
    queryFn: () => getDeviceById(id),
  });
}

/**
 * Hook to fetch device platforms for filter dropdown
 */
export function useDevicePlatforms() {
  return useQuery({
    queryKey: ['device-platforms'],
    queryFn: () => getDevicePlatforms(),
  });
}

/**
 * Hook to fetch device brands for filter dropdown
 */
export function useDeviceBrands() {
  return useQuery({
    queryKey: ['device-brands'],
    queryFn: () => getDeviceBrands(),
  });
}

/**
 * Hook to fetch device categories for filter dropdown
 */
export function useDeviceCategories() {
  return useQuery({
    queryKey: ['device-categories'],
    queryFn: () => getDeviceCategories(),
  });
}
