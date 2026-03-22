# Device Tracking Web App

Internal device tracking system with QR-based assignment flow built with Next.js, Supabase, and TanStack ecosystem.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth)
- **State Management:**
  - URL State: nuqs
  - Server State: TanStack Query
  - Forms: TanStack Form
  - Tables: TanStack Table
- **QR Codes:** qrcode + html5-qrcode
- **PWA:** Serwist
- **Validation:** Zod

## Project Structure

```
device-tracking/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group (login, callback)
│   │   ├── (dashboard)/       # Main app route group
│   │   ├── admin/             # Admin-only routes
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home/Dashboard page
│   │   ├── providers.tsx      # TanStack Query + nuqs providers
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── layout/            # App shell, nav, sidebar
│   │   └── shared/            # Reusable app components
│   ├── lib/
│   │   ├── supabase/          # Supabase clients (browser, server, middleware)
│   │   ├── query/             # TanStack Query keys & helpers
│   │   ├── utils/             # Utility functions
│   │   ├── env.ts             # Environment variable validation
│   │   └── server-env.ts      # Server-only env variables
│   ├── server/                # Server actions & RPC wrappers
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # Shared TypeScript types
├── supabase/                  # Supabase configuration
│   └── migrations/            # SQL migrations
├── .docs/                     # Project documentation
├── .env.local                 # Local environment variables (gitignored)
├── .env.example               # Environment variable template
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+
- Supabase project (configured externally)
- Google OAuth credentials (configured in Supabase)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your Supabase credentials and Google OAuth settings in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-only)
   - `NEXT_PUBLIC_APP_URL` - Your app URL (http://localhost:3000 for development)

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. **Set up the database** (see [Database Setup](#database-setup) below)

7. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

The app requires running SQL migrations in your Supabase project.

### Option 1: Using Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migrations in order:
   - `supabase/migrations/20260322000001_initial_schema.sql`
   - `supabase/migrations/20260322000002_role_helpers.sql`
   - `supabase/migrations/20260322000003_rls_policies.sql`

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

### Promoting First Admin User

After your first user signs in:

1. Open Supabase SQL Editor
2. Run `supabase/migrations/manual_admin_promotion.sql`
3. Update the email address in the script
4. Execute to promote user to admin

See [supabase/migrations/README.md](./supabase/migrations/README.md) for detailed migration documentation.

## Development Commands

```bash
pnpm dev      # Start development server with Turbopack
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Environment Variables

Required environment variables are validated at runtime using Zod. The app will fail to start if required variables are missing or invalid.

### Public Variables (accessible in browser)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_APP_URL` - Application URL

### Server-Only Variables (never exposed to browser)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for admin operations

## Features (Planned)

- ✅ Phase 1: Project foundation (COMPLETE)
- ✅ Phase 2: Database schema & security (COMPLETE)
- ✅ Phase 3: Authentication & user bootstrap (COMPLETE)
- ✅ Phase 4: App shell & responsive layout (COMPLETE)
- ✅ Phase 5: Device inventory features (COMPLETE)
- ✅ Phase 6: QR code generation (COMPLETE)
- ✅ Phase 7: Assignment engine (COMPLETE)
- ✅ Phase 8: QR scan flow (COMPLETE)
- ✅ Phase 9: My devices & audit history (COMPLETE)
- ✅ Phase 10: Admin tools (COMPLETE)
- ✅ Phase 11: PWA support (COMPLETE)
- ⏳ Phase 12: Validation & UX hardening

## License

Internal use only.
