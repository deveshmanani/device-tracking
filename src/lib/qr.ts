/**
 * QR Code payload utilities
 * Pure functions for generating and parsing device QR codes
 */

/**
 * Generate QR code payload for a device
 * Format: /scan/{deviceId}
 */
export function generateQRPayload(deviceId: string): string {
  if (!deviceId || typeof deviceId !== 'string') {
    throw new Error('Invalid device ID');
  }
  return `/scan/${deviceId}`;
}

/**
 * Parse device ID from a scanned QR code payload
 * Accepts:
 * - Full URL: https://example.com/scan/abc-123
 * - Path: /scan/abc-123
 * - Just the ID: abc-123
 */
export function parseQRPayload(payload: string): string | null {
  if (!payload || typeof payload !== 'string') {
    return null;
  }

  const trimmed = payload.trim();

  // Try to extract from full URL
  const urlMatch = trimmed.match(/\/scan\/([^/?#]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }

  // If it's just an ID (no /scan/ prefix), validate it looks like a UUID
  // UUID format: 8-4-4-4-12 hexadecimal characters
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Validate if a string is a valid QR payload format
 */
export function isValidQRPayload(payload: string): boolean {
  return parseQRPayload(payload) !== null;
}
