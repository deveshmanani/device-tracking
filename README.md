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

6. Open [http://localhost:3000](http://localhost:3000)

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
- ⏳ Phase 2: Database schema & security
- ⏳ Phase 3: Authentication & user bootstrap
- ⏳ Phase 4: App shell & responsive layout
- ⏳ Phase 5: Device inventory features
- ⏳ Phase 6: QR code generation
- ⏳ Phase 7: Assignment engine
- ⏳ Phase 8: QR scan flow
- ⏳ Phase 9: My devices & audit history
- ⏳ Phase 10: Admin tools
- ⏳ Phase 11: PWA support
- ⏳ Phase 12: Validation & UX hardening

## License

Internal use only.
