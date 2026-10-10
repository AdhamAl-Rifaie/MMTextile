# MMTextile Deployment Notes

## Production

- Website: https://mmtextile.vercel.app
- GitHub repo: https://github.com/AdhamAl-Rifaie/MMTextile
- Vercel project: `adhamal-rifaies-projects/mmtextile`
- Supabase project URL: `https://xmnmtyfrhjudvjcpsyuc.supabase.co`
- Supabase Storage bucket: `product-images`

## Required Environment Variables

Set these in Vercel Production.

```env
NEXT_PUBLIC_SUPABASE_URL=https://xmnmtyfrhjudvjcpsyuc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
SUPABASE_SECRET_KEY=<service-role-key>
SUPABASE_PRODUCT_IMAGE_BUCKET=product-images
ADMIN_EMAIL=<admin-login-email>
ADMIN_PASSWORD=<admin-login-password>
```

Do not commit real `.env` files. The repo intentionally ignores `.env*` except `.env.example`.

## Supabase Schema

The database schema lives in:

```txt
supabase/schema.sql
```

Run that file in Supabase SQL Editor when the schema changes.

Main tables:

- `public.mmtextile_products`
- `public.mmtextile_requests`

Storage:

- Bucket: `product-images`
- Public read policy is created by `supabase/schema.sql`.

## Data Migration

Local source data:

```txt
data/local-db.json
public/uploads/products/
```

Import/update without deleting existing Supabase rows:

```bash
npm run import:supabase
```

Reset Supabase app data, then import local data/images:

```bash
npm run import:supabase:reset
```

The reset script deletes:

- existing rows from `mmtextile_products`
- existing rows from `mmtextile_requests`
- existing files under `product-images/products`

Then it uploads local product images and upserts products from `data/local-db.json`.

## Deploy Flow

1. Confirm `.env` secrets are not staged:

```bash
git status --short
```

2. Validate locally:

```bash
npm run typecheck
npm run build
```

3. Run Supabase schema if needed:

```txt
Supabase Dashboard -> SQL Editor -> run supabase/schema.sql
```

4. Migrate data if needed:

```bash
npm run import:supabase:reset
```

5. Commit and push:

```bash
git add .
git commit -m "Describe deployment update"
git push
```

6. Deploy production:

```bash
npx vercel --prod
```

7. Verify:

```bash
Invoke-WebRequest -UseBasicParsing https://mmtextile.vercel.app
```

Expected status: `200`.

## Security Notes

- `SUPABASE_SECRET_KEY` must be a service-role key and must stay server-only.
- Rotate Supabase service-role keys if they are ever exposed in chat, screenshots, logs, or commits.
- `NEXT_PUBLIC_*` variables are public and visible to site visitors.
- Admin credentials are stored only as Vercel secrets.
