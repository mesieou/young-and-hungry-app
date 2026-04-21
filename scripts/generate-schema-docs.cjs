#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });

const databaseUrl =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
const auditPath = path.join(process.cwd(), "schema_audit.sql");
const schemaDocPath = path.join(process.cwd(), "supabase", "SCHEMA.md");
const updatedAt = new Date().toISOString().slice(0, 10);

const dump = spawnSync(
  "pg_dump",
  [databaseUrl, "--schema=public", "--schema-only", "--no-owner", "--no-privileges"],
  { encoding: "utf8" }
);

if (dump.status !== 0) {
  process.stderr.write(dump.stderr || "Failed to dump database schema.\n");
  process.exit(dump.status ?? 1);
}

fs.writeFileSync(auditPath, dump.stdout);

const schemaDoc = `# Supabase Schema

Last updated: ${updatedAt}

This file is updated by \`npm run db:schema\`.

## Source Of Truth

- Migrations live in \`supabase/migrations\`.
- Raw schema dump lives in \`schema_audit.sql\`.
- Critical booking/payment logic lives in Postgres RPCs, not duplicated TypeScript transitions.

## Required Critical-Core Tables

- \`quotes\`
- \`bookings\`
- \`payments\`
- \`booking_bucket_locks\`
- \`domain_events\`
- \`command_dedup\`
- \`outbox_jobs\`
- \`notifications\`
- \`ops_issues\`
- \`alert_deliveries\`
`;

fs.writeFileSync(schemaDocPath, schemaDoc);

console.log("Schema documentation updated:");
console.log(`- ${path.relative(process.cwd(), auditPath)}`);
console.log(`- ${path.relative(process.cwd(), schemaDocPath)}`);
