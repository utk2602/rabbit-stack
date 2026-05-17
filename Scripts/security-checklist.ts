import { spawnSync } from "child_process";

interface Check {
  name: string;
  command: string;
  args: string[];
  optional?: boolean;
}

const checks: Check[] = [
  { name: "Prisma client generation", command: "npx.cmd", args: ["prisma", "generate"] },
  { name: "TypeScript", command: "npx.cmd", args: ["tsc", "--noEmit"] },
  { name: "Security environment", command: "npm.cmd", args: ["run", "security:env"], optional: true },
];

let failed = false;

for (const check of checks) {
  console.log(`\n== ${check.name} ==`);
  const result = spawnSync(check.command, check.args, {
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    if (check.optional) {
      console.warn(`${check.name} did not pass. Fix before production deploy.`);
    } else {
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("\nSecurity checklist completed.");
