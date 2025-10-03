# K94L Admin & Website (Next.js)

This folder hosts the new Next.js application served from Vercel. It includes:

- **Public website** (`/`) – renders the portfolio with server-side data from Supabase (backlinks baked into the HTML using ISR).
- **Admin interface** (`/admin`) – protected by Google sign-in (NextAuth) for updating portfolio entries (add/edit/delete).
- **API routes** – CRUD endpoints under `/api/portfolio` that update Supabase and trigger revalidation of the public page.

## Prerequisites

1. A Supabase project with a `portfolio_companies` table containing columns:
   - `id` (int8, primary key, auto-increment)
   - `created_at` (timestamp, default `now()`)
   - `name`, `industry`, `tag`, `website`, `year` (all `text`)
2. Google OAuth credentials (Client ID/Secret) for your Google account.
3. A secret string for NextAuth.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Key | Description |
| --- | --- |
| `NEXTAUTH_SECRET` | Random string used to sign NextAuth JWT cookies. |
| `NEXTAUTH_URL` | Local URL during development (`http://localhost:3000`). Vercel sets this automatically in production. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credentials from Google Cloud Console OAuth consent screen. |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_ANON_KEY` | Public anon key (used for static rendering). |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, used in API routes). |
| `ADMIN_EMAILS` | Comma-separated list of emails allowed to sign in. |

> **Important:** Never commit `.env.local` – keep secrets out of version control. Add the same keys in Vercel’s project settings when deploying.

## Development

Install dependencies (inside the `web/` folder the first time):

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Visit <http://localhost:3000>. The home page renders portfolio data from Supabase. Navigate to `/admin` and sign in with Google to add, edit, or delete companies.

## Deployment

1. Push this repo to GitHub (or another git host) and connect it to Vercel.
2. In Vercel’s dashboard set the environment variables listed above (include the `ADMIN_EMAILS` and Supabase keys).
3. Trigger a deployment. The public site will revalidate automatically when the admin saves changes.

## Data flow

- Admin actions call `/api/portfolio` (protected by NextAuth). Successful writes invalidate the cached home page so new data appears within ~60 seconds.
- The static `/` route uses Supabase’s anon key at build/request time only – the service key never reaches the browser.

## Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start local dev server (Turbopack). |
| `npm run build` | Production build. |
| `npm run start` | Run the production server locally. |
| `npm run lint` | Lints the code base. |

## Support contact

If access to `/admin` fails, confirm the email is listed in `ADMIN_EMAILS` and that Google OAuth callback URLs match your Vercel domain plus `http://localhost:3000` for development.
