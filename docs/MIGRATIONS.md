# Database Migration Discipline

Follow the Skedy-style migration workflow:

1. Create timestamped Supabase SQL migrations.
2. Run `supabase db push --dry-run`.
3. Apply to development.
4. Regenerate schema docs with `npm run db:schema`.
5. Commit migration, schema docs, and tests together.

Rules:

- No Supabase dashboard-only schema edits.
- Critical transition changes must be SQL/RPC changes.
- TypeScript wrappers must track RPC contracts but must not duplicate transition logic.
- Every critical migration must have pgTAP coverage under `supabase/tests/database`.
- Run `npm run test:db` against a migrated database before applying booking/payment migrations remotely.
- `npm run db:q -- "SELECT ..."` uses Skedy's direct `DATABASE_URL` style for fast inspection.
- `npm run db:reset` is only needed when using the local Supabase Docker stack from scratch.
