# K94L Holding Website

A lightweight static site for K94L Holding mirroring the live Databutton experience. The portfolio section is powered by a CSV file so updates can be done without touching the markup or scripts.

## Project layout

```
./
├── assets/
│   └── k94l-red.png          # Logo asset (favicon + header)
├── data/
│   └── portfolio.csv         # Source of truth for the portfolio grid
├── index.html                # Main page
├── script.js                 # Handles CSV loading + preview logic
├── styles.css                # Styling
├── generate_portfolio.py     # Builds static markup from the CSV
├── web/                      # Next.js app (Vercel deployment + admin)
└── README.md
```

## Local development

1. From this folder run a simple web server (any static server works):
   ```bash
   python3 -m http.server 3000
   ```
2. Visit `http://localhost:3000`.
3. The page auto-loads `data/portfolio.csv` and renders the portfolio grid.

> Opening the file directly from the filesystem will block `fetch()` in some browsers; the local server avoids that.

## Updating the portfolio

- Keep the `portfolio.csv` headers as:
  ```text
  name,industry,status,year,url
  ```
- Status is case-insensitive and accepts `Invested`, `Exited`, or `RIP` (others fall back to a neutral badge).
- URLs may be empty; otherwise include the full address (`https://…`).
- Portfolio and exit counters update automatically (rows marked `RIP` are skipped from the portfolio total).
- After running the generator you can spin up the local server to confirm the layout before publishing changes.

### Suggested workflow

1. Export or edit the portfolio list in your spreadsheet tool.
2. Save as CSV using UTF-8 encoding.
3. Run `python generate_portfolio.py` to rebuild the portfolio markup (updates the homepage and company count).
4. (Optional) Start a local server to double-check: `python3 -m http.server 3000`.
5. Deploy the updated files (`index.html`, `data/portfolio.csv`, etc.) to one.com.
6. Alternatively, manage the data via the Vercel/Next.js admin in `web/`.

## Deploying to one.com

One.com hosting serves static files from the `public_html` directory of your space.

1. Zip or upload the files/folders listed above to `public_html` (or a subfolder if you prefer).
   - You can use the One.com File Manager (Control Panel → File Manager) or any FTP client (host: `ftp.one.com`).
2. Ensure the uploaded structure matches this repository (i.e. `index.html` lives at the root and the `assets/` + `data/` folders sit next to it).
3. If the domain should resolve directly to the site, keep the files at the top level of `public_html`. Otherwise place them in a folder (e.g. `/k94l`) and point the domain or subdomain to that directory via One.com DNS settings.
4. To update the portfolio later, upload the new `data/portfolio.csv` to the same location—no other files need to change.

### Going live on your domain

- After the files are uploaded, set the domain’s web root in One.com to the directory that contains `index.html` (Control Panel → Domains → Website settings → Change web root).
- DNS propagation can take a few minutes. Once complete, visiting the domain should render the site.
- Keep a backup of the CSV so you can roll back quickly if needed.

## Next steps / enhancements

- Add analytics or SEO metadata if needed for broader visibility.
- Protect the CSV upload flow behind a password and persist uploads via a small serverless function if One.com allows dynamic scripting.
- Automate deployment using a GitHub Action that deploys on push via FTP or the One.com API.

## Next.js + Supabase admin (Vercel)

The `web/` directory contains the Next.js project deployed to Vercel. It provides:
- Google-authenticated access to `/admin` for editing companies in Supabase
- API routes that revalidate the public page after changes

Follow `web/README.md` for environment variables and deployment steps.
