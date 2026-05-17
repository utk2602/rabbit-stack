/**
 * Runs npm audit and stores the JSON summary in the database.
 *
 * Usage:
 *   npm run audit:ingest
 *
 * Requires DATABASE_URL.
 */

import "dotenv/config";
import { execFile } from "child_process";
import { promisify } from "util";
import { db } from "../lib/db";
import { recordNpmAudit } from "../lib/dependency-audit";

const execFileAsync = promisify(execFile);

async function runNpmAudit() {
  try {
    const { stdout } = await execFileAsync(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["audit", "--omit=dev", "--json"],
      { maxBuffer: 1024 * 1024 * 10 }
    );
    return stdout;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "stdout" in error &&
      typeof error.stdout === "string"
    ) {
      return error.stdout;
    }

    throw error;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const stdout = await runNpmAudit();
  const payload = JSON.parse(stdout);
  const audit = await recordNpmAudit(payload);

  console.log("Dependency audit ingested");
  console.log(`Total: ${audit.total}`);
  console.log(`Critical: ${audit.critical}`);
  console.log(`High: ${audit.high}`);
  console.log(`Moderate: ${audit.moderate}`);
  console.log(`Fixable: ${audit.fixable}`);
}

main()
  .catch((error) => {
    console.error("Dependency audit ingestion failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
