import { z } from 'zod';
import type { DeviceStatus } from '@/types/database';

// Device validation schemas
export const deviceSchema = z.object({
  name: z.string()
    .min(1, 'Device name is required')
    .max(100, 'Device name must be less than 100 characters')
    .trim(),
  
  brand: z.string()
    .min(1, 'Brand is required')
    .max(50, 'Brand must be less than 50 characters')
    .trim(),
  
  model: z.string()
    .min(1, 'Model is required')
    .max(100, 'Model must be less than 100 characters')
    .trim(),
  
  asset_tag: z.string()
    .min(1, 'Asset tag is required')
    .max(50, 'Asset tag must be less than 50 characters')
    .trim()
    .regex(/^[A-Z0-9-]+$/, 'Asset tag must contain only uppercase letters, numbers, and hyphens'),
  
  serial_number: z.string()
    .max(100, 'Serial number must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  
  imei: z.string()
    .max(50, 'IMEI must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  
  platform: z.enum(['iOS', 'Android', 'Windows', 'macOS', 'Linux', 'Other'], {
    message: 'Please select a valid platform',
  }),
  
  os_version: z.string()
    .max(50, 'OS version must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  
  location_name: z.string()
    .max(100, 'Location must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  
  purchase_date: z.string()
    .min(1, 'Purchase date is required')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  
  warranty_expiry: z.string()
    .min(1, 'Warranty expiry date is required')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .refine((date) => {
      const warrantyDate = new Date(date);
      return warrantyDate > new Date();
    }, 'Warranty expiry must be in the future').optional().or(z.literal('')),
  
  image_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  condition_note: z.string()
    .max(500, 'Condition notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type DeviceFormData = z.infer<typeof deviceSchema>;

// Device update schema (allows partial updates)
export const deviceUpdateSchema = deviceSchema.partial().extend({
  id: z.string().uuid('Invalid device ID'),
});

export type DeviceUpdateData = z.infer<typeof deviceUpdateSchema>;

// Status transition validation
const validStatuses: DeviceStatus[] = ['available', 'checked_out', 'in_repair', 'retired', 'lost'];

export const statusTransitionSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
  newStatus: z.enum(['available', 'in_repair', 'retired', 'lost'], {
    message: 'Invalid status. Cannot manually set to "checked_out"',
  }),
});

export type StatusTransitionData = z.infer<typeof statusTransitionSchema>;

// QR payload parsing validation
export const qrPayloadSchema = z.object({
  deviceId: z.string()
    .uuid('Invalid QR code: device ID must be a valid UUID')
    .min(1, 'Invalid QR code: device ID is required'),
});

export type QRPayloadData = z.infer<typeof qrPayloadSchema>;

// Alternative QR formats (URL-based)
export const qrUrlSchema = z.string()
  .url('Invalid QR code URL')
  .refine(
    (url) => url.includes('/scan/') || url.includes('/devices/'),
    'QR code URL must contain /scan/ or /devices/'
  );

// Assignment action validation
export const assignmentSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
  userId: z.string().uuid('Invalid user ID').optional(),
});

export type AssignmentData = z.infer<typeof assignmentSchema>;

// Return action validation
export const returnSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
});

export type ReturnData = z.infer<typeof returnSchema>;

// Admin manual assignment validation
export const adminAssignmentSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
  userId: z.string().uuid('User ID is required for manual assignment'),
});

export type AdminAssignmentData = z.infer<typeof adminAssignmentSchema>;

// User search/filter validation
export const deviceFiltersSchema = z.object({
  search: z.string().max(100, 'Search query too long').optional(),
  status: z.enum(validStatuses).optional(),
  platform: z.string().max(50).optional(),
  brand: z.string().max(50).optional(),
});

export type DeviceFiltersData = z.infer<typeof deviceFiltersSchema>;

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(25),
});

export type PaginationData = z.infer<typeof paginationSchema>;
