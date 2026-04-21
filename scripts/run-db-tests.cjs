#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });

const databaseUrl =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
const testsDir = path.join(process.cwd(), "supabase", "tests", "database");

function runPsql(args, label) {
  const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", ...args], {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    console.error(`Database test step failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

if (!fs.existsSync(testsDir)) {
  console.error(`Database tests directory not found: ${testsDir}`);
  process.exit(1);
}

const testFiles = fs
  .readdirSync(testsDir)
  .filter((file) => file.endsWith(".test.sql"))
  .sort();

if (testFiles.length === 0) {
  console.error(`No database test files found in ${testsDir}`);
  process.exit(1);
}

runPsql(["-c", "create extension if not exists pgtap;"], "ensure pgtap extension");

testFiles.forEach((file) => {
  const absolutePath = path.join(testsDir, file);
  console.log(`\nRunning ${path.relative(process.cwd(), absolutePath)}`);
  runPsql(["-f", absolutePath], file);
});

console.log("\nDatabase tests passed.");
