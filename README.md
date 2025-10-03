# K94L Holding Website

A lightweight marketing site for K94L Holding with an investment portfolio that is now maintained through the Next.js + Supabase admin. The legacy static CSV workflow is still kept in the repo for reference, but production edits should run through the admin panel.

## Project layout

```
./
├── assets/                  # Legacy static assets (used by the old CSV build)
├── data/                    # Legacy portfolio.csv (only needed if you rebuild the static version)
├── generate_portfolio.py    # Helper to rebuild the static HTML from the CSV (legacy)
├── index.html / script.js / styles.css   # Legacy static site
├── web/                     # Next.js app served from Vercel (public site + admin)
└── README.md                # Docs
```

## Local development (Next.js / Supabase)

1. Install dependencies once:
   ```bash
   cd web
   npm install
   ```
2. Create `web/.env.local` (see `web/.env.example`) with your Supabase keys, Google OAuth credentials, `NEXTAUTH_SECRET`, and the email(s) allowed to sign in.
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin` to log in with Google and manage portfolio entries.

> The admin writes directly to Supabase and triggers revalidation, so the homepage updates automatically after each change.

### Optional: legacy static preview

If you need to rebuild or preview the original CSV-driven site:

```bash
python generate_portfolio.py     # rebuilds index.html markup from data/portfolio.csv
python3 -m http.server 3000      # serve the static files
```
Then open `http://localhost:3000`.

## Updating the portfolio (production workflow)

1. Go to `/admin` on the deployed site (Google sign-in required).
2. Add, edit, or delete companies. Empty website/contact fields are allowed; the UI normalizes blank values for Supabase.
3. Each save revalidates the homepage so it reflects the latest data within seconds.

### Legacy CSV workflow (optional)

If you must maintain the static CSV version:

1. Edit `data/portfolio.csv` (headers: `name,industry,status,year,url`).
2. Run `python generate_portfolio.py`.
3. Serve or upload the generated files manually (see next section).

## Deployments

### Vercel (production)

- The `web/` app is connected to Vercel. Pushes to `main` trigger automatic builds.
- Environment variables live in the Vercel dashboard (match `.env.local`).
- Custom domain `k94l.com` points to Vercel via one.com DNS (A record to `76.76.21.21`, CNAME `www → <vercel-dns>.com`).
- Google OAuth redirect URIs should include `https://k94l.com/api/auth/callback/google` (and `www` if used).

### One.com (legacy static host)

If you still need the original static files on one.com:

1. Upload `index.html`, `assets/`, `data/`, `script.js`, and `styles.css` to `public_html`.
2. Update `data/portfolio.csv` and rerun the generator whenever the portfolio changes.
3. Set the web root in one.com to the folder containing `index.html`.

## Next steps / enhancements

- Add analytics or additional SEO metadata if desired.
- Automate Supabase seeding or nightly exports if you want a CSV backup.
- Remove the legacy static workflow when you are confident everything runs through the admin.

## Related docs

- `web/README.md` – detailed environment variable list and Vercel deployment steps for the Next.js app.
- Supabase policies – ensure the `portfolio_companies` table keeps the `anon` select policy so the homepage can read data.
