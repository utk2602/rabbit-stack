const REQUIRED_VARIABLES = [
  "DATA_ENCRYPTION_KEY",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
] as const;

function isValidEncryptionKey(value: string | undefined) {
  if (!value) return false;

  try {
    return Buffer.from(value, "base64").length === 32;
  } catch {
    return false;
  }
}

const missing = REQUIRED_VARIABLES.filter((name) => !process.env[name]);
const errors: string[] = [];

if (missing.length > 0) {
  errors.push(`Missing required variables: ${missing.join(", ")}`);
}

if (!isValidEncryptionKey(process.env.DATA_ENCRYPTION_KEY)) {
  errors.push("DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
}

if ((process.env.BETTER_AUTH_SECRET?.length ?? 0) < 32) {
  errors.push("BETTER_AUTH_SECRET should be at least 32 characters.");
}

if (process.env.BETTER_AUTH_URL) {
  try {
    new URL(process.env.BETTER_AUTH_URL);
  } catch {
    errors.push("BETTER_AUTH_URL must be a valid URL.");
  }
}

if (errors.length > 0) {
  console.error("Security environment check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Security environment check passed.");
