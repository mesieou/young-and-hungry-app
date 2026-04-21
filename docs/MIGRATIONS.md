# Database Migration Discipline

Follow the Skedy-style migration workflow:

1. Create timestamped Supabase SQL migrations.
2. Run `supabase db push --dry-run`.
3. Apply to development.
4. Regenerate schema docs.
5. Commit migration, schema docs, and tests together.

Rules:

- No Supabase dashboard-only schema edits.
- Critical transition changes must be SQL/RPC changes.
- TypeScript wrappers must track RPC contracts but must not duplicate transition logic.
