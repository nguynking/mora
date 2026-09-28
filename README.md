# Mora

A minimal workspace for direct messages, group chats, and named AI coworkers.

The current app uses **Next.js** for both its frontend and API routes and is configured for **Vercel**. See [Vercel setup, CI, and data cutover](docs/VERCEL.md) before deployment.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
pnpm test:layout
```

For local authenticated development, configure `.env.local` from `.env.example`, provision a separate development Supabase project, apply migrations with `pnpm db:migrate`, then run `pnpm dev`. Load local environment values into the migration process using your shell or `node --env-file=.env.local scripts/migrate.mjs`.

The interface follows [docs/BRAND.md](docs/BRAND.md) v4: paper and ink, a Newsreader serif for titles, the flourish mark, and public-domain paintings (CC0, credited in `lib/art.ts`). Old Sites build scripts and D1 migrations are retained for reference and data recovery, and are not used by Vercel.
