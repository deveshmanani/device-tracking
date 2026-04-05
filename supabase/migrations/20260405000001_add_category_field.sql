-- Add category column to devices table
-- Category is a free-text field managed dynamically by admins
ALTER TABLE devices ADD COLUMN category TEXT;
