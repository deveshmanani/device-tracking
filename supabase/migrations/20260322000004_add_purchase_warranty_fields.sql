-- Migration: Add purchase_date and warranty_expiry fields to devices table
-- Description: Add missing fields that are used in the device form
-- Created: 2026-03-22

-- Add purchase_date column to devices table
ALTER TABLE devices
ADD COLUMN purchase_date DATE;

-- Add warranty_expiry column to devices table
ALTER TABLE devices
ADD COLUMN warranty_expiry DATE;

-- Add comment for clarity
COMMENT ON COLUMN devices.purchase_date IS 'Date when the device was purchased';
COMMENT ON COLUMN devices.warranty_expiry IS 'Date when the device warranty expires';
