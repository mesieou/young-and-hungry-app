#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawnSync } = require("child_process");
const dotenv = require("dotenv");

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });

const sql = process.argv.slice(2).join(" ");
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:55422/postgres";

const args = sql.trim() ? [databaseUrl, "-c", sql] : [databaseUrl];
const result = spawnSync("psql", args, { stdio: "inherit" });

process.exit(result.status ?? 1);
