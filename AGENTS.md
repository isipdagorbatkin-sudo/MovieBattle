# Build & Dev Commands

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm start` - Start production server
- `npm run lint` - Run linter

# Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `TMDB_API_KEY` - TMDB API key (v3 auth)

# Database

Run `supabase/migrations/00001_initial_schema.sql` in Supabase SQL editor.
