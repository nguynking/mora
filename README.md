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

The merged monochrome interface and brand documentation remain in [docs/BRAND.md](docs/BRAND.md). Old Sites build scripts and D1 migrations are retained for reference and data recovery, and are not used by Vercel.
