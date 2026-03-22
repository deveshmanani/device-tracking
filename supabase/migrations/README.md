# Database Migrations

This folder contains Supabase SQL migrations for the device tracking application.

## Migration Files

| File | Description |
|------|-------------|
| `20260322000001_initial_schema.sql` | Creates enums, tables, indexes, and triggers |
| `20260322000002_role_helpers.sql` | Role checking functions for RLS policies |
| `20260322000003_rls_policies.sql` | Row Level Security policies for all tables |
| `manual_admin_promotion.sql` | Script to promote a user to admin role |
| `seed_sample_data.sql` | Sample devices and events for testing (optional) |

## Schema Overview

### Enums
- `app_role`: user, admin
- `device_status`: available, checked_out, in_repair, retired, lost
- `assignment_source`: scan, admin_manual, bulk_import
- `device_event_type`: device_created, device_updated, qr_generated, assigned, returned, status_changed, override_assigned

### Tables

#### `profiles`
Extends `auth.users` with app-specific user data.
- `id` (UUID, FK to auth.users)
- `email` (TEXT, unique)
- `full_name` (TEXT)
- `role` (app_role, default: 'user')
- `is_active` (BOOLEAN, default: true)
- Timestamps: created_at, updated_at

#### `devices`
Device inventory with QR codes.
- `id` (UUID, primary key)
- `asset_tag` (TEXT, unique, required)
- `qr_code_value` (TEXT, unique, required)
- `name`, `brand`, `model`, `platform` (TEXT, required)
- `os_version`, `serial_number`, `imei` (TEXT, optional)
- `status` (device_status, default: 'available')
- `condition_note`, `location_name`, `image_url` (TEXT, optional)
- `created_by` (UUID, FK to profiles)
- Timestamps: created_at, updated_at

#### `device_assignments`
Tracks device checkout/checkin history.
- `id` (UUID, primary key)
- `device_id` (UUID, FK to devices)
- `user_id` (UUID, FK to profiles)
- `assigned_at` (TIMESTAMPTZ, default: NOW)
- `returned_at` (TIMESTAMPTZ, NULL = still checked out)
- `assignment_source` (assignment_source, required)
- `purpose`, `condition_out`, `condition_in`, `notes` (TEXT, optional)
- `expected_return_at` (TIMESTAMPTZ, optional)
- **Constraint**: Only one active (returned_at IS NULL) assignment per device

#### `device_events`
Audit trail for all device mutations.
- `id` (UUID, primary key)
- `device_id` (UUID, FK to devices)
- `actor_user_id` (UUID, FK to profiles)
- `event_type` (device_event_type, required)
- `metadata` (JSONB, default: {})
- `created_at` (TIMESTAMPTZ, default: NOW)

## Running Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# Link to your project (first time only)
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Check migration status
supabase migration list
```

### Option 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open each migration file in order
4. Execute them one by one

**IMPORTANT**: Run migrations in order:
1. `20260322000001_initial_schema.sql`
2. `20260322000002_role_helpers.sql`
3. `20260322000003_rls_policies.sql`

## Promoting First Admin

After your first user signs in with Google OAuth:

1. Open Supabase SQL Editor
2. Open `manual_admin_promotion.sql`
3. Replace `'user@example.com'` with the actual user's email
4. Execute the script
5. Verify with the verification query at the bottom

## Seeding Sample Data (Optional)

To populate the database with sample devices for testing:

1. Ensure at least one user has logged in and has a profile
2. (Optional) Promote a user to admin first using the steps above
3. Open Supabase SQL Editor
4. Run `seed_sample_data.sql`
5. Script will create:
   - 15 sample devices (iPhones, Android phones, iPads, tablets, laptops)
   - Various device statuses (available, checked_out, in_repair, retired, lost)
   - Device assignments for checked_out devices
   - Device events (creation, assignments, status changes)

**Note**: The seed script uses the first admin user (or first user if no admin) as the creator of all devices.

## Row Level Security (RLS)

All tables have RLS enabled with the following access patterns:

### Profiles
- ✅ All authenticated users can read
- ✅ Users can update own profile (except role)
- ✅ Only admins can insert profiles

### Devices
- ✅ All authenticated users can read
- ✅ Only admins can insert/update/delete

### Device Assignments
- ✅ Users can read own assignments
- ✅ Admins can read all assignments
- ✅ Only admins can insert/update directly (server actions bypass RLS)

### Device Events
- ✅ Users can read events for visible devices
- ✅ Only admins can insert directly (server actions bypass RLS)

## Helper Functions

- `get_user_role(uid UUID)` - Get role for a specific user
- `is_admin(uid UUID)` - Check if user is admin
- `current_user_id()` - Get current authenticated user ID
- `current_user_is_admin()` - Check if current user is admin

These functions are SECURITY DEFINER and safe to use in RLS policies.

## Rollback

To rollback migrations (use with caution):

```sql
-- Drop tables in reverse order (due to foreign keys)
DROP TABLE IF EXISTS device_events CASCADE;
DROP TABLE IF EXISTS device_assignments CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS current_user_is_admin();
DROP FUNCTION IF EXISTS current_user_id();
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop enums
DROP TYPE IF EXISTS device_event_type;
DROP TYPE IF EXISTS assignment_source;
DROP TYPE IF EXISTS device_status;
DROP TYPE IF EXISTS app_role;
```

## Notes

- All tables have timestamps (created_at, updated_at)
- updated_at is automatically updated via triggers
- Unique constraint ensures only one active assignment per device
- All mutations should create corresponding device_events entries
- Server actions use service role to bypass RLS for authorized operations
