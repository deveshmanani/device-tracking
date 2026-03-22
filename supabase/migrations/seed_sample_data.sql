-- Seed Data for Device Tracking App
-- Run this after all migrations are complete
-- This creates sample devices, profiles, and events for testing

-- Note: This script assumes at least one user has logged in and has a profile
-- The script will use the first admin user it finds, or the first user if no admin exists

DO $$
DECLARE
  admin_user_id uuid;
  standard_user_id uuid;
  device_ids uuid[] := ARRAY[]::uuid[];
  i integer;
BEGIN
  -- Get an admin user (or first user if no admin)
  SELECT id INTO admin_user_id 
  FROM profiles 
  WHERE role = 'admin' 
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id 
    FROM profiles 
    LIMIT 1;
  END IF;
  
  -- Get a standard user (or create placeholder if none exists)
  SELECT id INTO standard_user_id 
  FROM profiles 
  WHERE role = 'standard' AND id != admin_user_id
  LIMIT 1;
  
  IF standard_user_id IS NULL THEN
    standard_user_id := admin_user_id;
  END IF;
  
  RAISE NOTICE 'Using admin user: %', admin_user_id;
  RAISE NOTICE 'Using standard user: %', standard_user_id;
  
  -- Insert sample devices
  INSERT INTO devices (
    name, brand, model, platform, os_version, serial_number, imei, asset_tag,
    status, condition_note, location_name, image_url, qr_code_value, created_by
  ) VALUES
    -- iPhones
    (
      'iPhone 15 Pro', 'Apple', 'iPhone 15 Pro', 'iOS', '17.4',
      'F7G8H9J1K2L3', '356789012345678', 'ASSET-001',
      'available', 'Excellent condition, no scratches', 'Office - IT Desk',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
      '/scan/device-001', admin_user_id
    ),
    (
      'iPhone 14', 'Apple', 'iPhone 14', 'iOS', '17.3',
      'M3N4P5Q6R7S8', '356789012345679', 'ASSET-002',
      'checked_out', 'Good condition, minor wear on edges', 'Office - Storage',
      'https://images.unsplash.com/photo-1663499482523-1c0d8bfa0f1e?w=400',
      '/scan/device-002', admin_user_id
    ),
    (
      'iPhone 13 Mini', 'Apple', 'iPhone 13 Mini', 'iOS', '17.2',
      'T9U1V2W3X4Y5', '356789012345680', 'ASSET-003',
      'available', 'Good condition', 'Office - IT Desk',
      'https://images.unsplash.com/photo-1632633173522-c28ca0a5a2ad?w=400',
      '/scan/device-003', admin_user_id
    ),
    
    -- Android Phones
    (
      'Galaxy S24 Ultra', 'Samsung', 'SM-S928U', 'Android', '14',
      'R9E8N7D6O5M4', '357890123456781', 'ASSET-004',
      'available', 'Brand new, sealed', 'Office - Storage',
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
      '/scan/device-004', admin_user_id
    ),
    (
      'Pixel 8 Pro', 'Google', 'Pixel 8 Pro', 'Android', '14',
      'P3I4X5E6L7P8', '357890123456782', 'ASSET-005',
      'checked_out', 'Excellent condition', 'Office - IT Desk',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
      '/scan/device-005', admin_user_id
    ),
    (
      'OnePlus 12', 'OnePlus', 'CPH2583', 'Android', '14',
      'O9N8E7P6L5U4', '357890123456783', 'ASSET-006',
      'in_repair', 'Screen replacement in progress', 'Repair Center',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      '/scan/device-006', admin_user_id
    ),
    
    -- iPads
    (
      'iPad Pro 12.9"', 'Apple', 'iPad Pro (6th gen)', 'iPadOS', '17.4',
      'I9P8A7D6P5R4', NULL, 'ASSET-007',
      'available', 'Excellent condition with Apple Pencil', 'Office - Conference Room',
      'https://images.unsplash.com/photo-1585790050230-5dd28404f3ab?w=400',
      '/scan/device-007', admin_user_id
    ),
    (
      'iPad Air', 'Apple', 'iPad Air (5th gen)', 'iPadOS', '17.3',
      'I3P2A1D9A8I7', NULL, 'ASSET-008',
      'checked_out', 'Good condition', 'Office - IT Desk',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      '/scan/device-008', admin_user_id
    ),
    
    -- Android Tablets
    (
      'Galaxy Tab S9', 'Samsung', 'SM-X910', 'Android', '14',
      'G9A8L7A6X5Y4', NULL, 'ASSET-009',
      'available', 'Brand new with S Pen', 'Office - Storage',
      'https://images.unsplash.com/photo-1585790050230-5dd28404f3ab?w=400',
      '/scan/device-009', admin_user_id
    ),
    
    -- Laptops
    (
      'MacBook Pro 16"', 'Apple', 'MacBook Pro M3 Max', 'macOS', '14.4',
      'M9B8K7P6R5O4', NULL, 'ASSET-010',
      'checked_out', 'Excellent condition, 64GB RAM', 'Office - Dev Team',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      '/scan/device-010', admin_user_id
    ),
    (
      'MacBook Air M2', 'Apple', 'MacBook Air M2', 'macOS', '14.3',
      'M7A6I8R9M2B1', NULL, 'ASSET-011',
      'available', 'Good condition, 16GB RAM', 'Office - Storage',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400',
      '/scan/device-011', admin_user_id
    ),
    (
      'ThinkPad X1 Carbon', 'Lenovo', 'X1 Carbon Gen 11', 'Windows', '11 Pro',
      'T8H9I6N7K8P9', NULL, 'ASSET-012',
      'available', 'Like new, 32GB RAM', 'Office - IT Desk',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
      '/scan/device-012', admin_user_id
    ),
    (
      'Dell XPS 15', 'Dell', 'XPS 15 9530', 'Windows', '11 Pro',
      'D9E8L7L6X5P4', NULL, 'ASSET-013',
      'retired', 'Hardware issues, scheduled for disposal', 'Office - Storage',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400',
      '/scan/device-013', admin_user_id
    ),
    (
      'Surface Laptop 5', 'Microsoft', 'Surface Laptop 5', 'Windows', '11 Pro',
      'S9U8R7F6A5C4', NULL, 'ASSET-014',
      'lost', 'Reported missing after conference', 'Unknown',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
      '/scan/device-014', admin_user_id
    ),
    
    -- Accessories/Other
    (
      'AirPods Pro', 'Apple', 'AirPods Pro (2nd gen)', 'iOS', NULL,
      'A9P8O7D6S5P4', NULL, 'ASSET-015',
      'available', 'Brand new, sealed', 'Office - Storage',
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
      '/scan/device-015', admin_user_id
    )
  RETURNING id INTO device_ids;
  
  RAISE NOTICE 'Inserted % devices', array_length(device_ids, 1);
  
  -- Create device assignments for checked_out devices
  INSERT INTO device_assignments (device_id, user_id, assigned_by, source, notes)
  SELECT 
    d.id,
    standard_user_id,
    admin_user_id,
    'manual',
    'Initial assignment for testing'
  FROM devices d
  WHERE d.status = 'checked_out'
  AND d.created_by = admin_user_id;
  
  RAISE NOTICE 'Created assignments for checked_out devices';
  
  -- Create device events for all devices
  -- Device created events
  INSERT INTO device_events (device_id, event_type, performed_by, metadata)
  SELECT 
    id,
    'device_created',
    admin_user_id,
    jsonb_build_object(
      'initial_status', status,
      'location', location_name
    )
  FROM devices
  WHERE created_by = admin_user_id;
  
  -- Assignment events for checked_out devices
  INSERT INTO device_events (device_id, event_type, performed_by, target_user_id, metadata)
  SELECT 
    d.id,
    'device_assigned',
    admin_user_id,
    standard_user_id,
    jsonb_build_object(
      'source', 'manual',
      'notes', 'Initial assignment for testing'
    )
  FROM devices d
  WHERE d.status = 'checked_out'
  AND d.created_by = admin_user_id;
  
  -- Repair event for device in repair
  INSERT INTO device_events (device_id, event_type, performed_by, metadata)
  SELECT 
    id,
    'status_changed',
    admin_user_id,
    jsonb_build_object(
      'from_status', 'available',
      'to_status', 'in_repair',
      'reason', 'Screen replacement needed'
    )
  FROM devices
  WHERE status = 'in_repair'
  AND created_by = admin_user_id;
  
  -- Lost event
  INSERT INTO device_events (device_id, event_type, performed_by, metadata)
  SELECT 
    id,
    'status_changed',
    admin_user_id,
    jsonb_build_object(
      'from_status', 'checked_out',
      'to_status', 'lost',
      'reason', 'Reported missing after conference'
    )
  FROM devices
  WHERE status = 'lost'
  AND created_by = admin_user_id;
  
  -- Retired event
  INSERT INTO device_events (device_id, event_type, performed_by, metadata)
  SELECT 
    id,
    'status_changed',
    admin_user_id,
    jsonb_build_object(
      'from_status', 'available',
      'to_status', 'retired',
      'reason', 'Hardware issues beyond repair'
    )
  FROM devices
  WHERE status = 'retired'
  AND created_by = admin_user_id;
  
  RAISE NOTICE 'Created device events';
  RAISE NOTICE 'Seed data insertion complete!';
  
END $$;
