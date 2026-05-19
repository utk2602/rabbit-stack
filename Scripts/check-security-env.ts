import "dotenv/config";
import { validateSecurityEnv } from "../lib/security-env";

const errors = validateSecurityEnv();

if (errors.length > 0) {
  console.error("Security environment check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Security environment check passed.");
