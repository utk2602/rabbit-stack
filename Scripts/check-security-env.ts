const REQUIRED_VARIABLES = ["DATA_ENCRYPTION_KEY"] as const;

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

if (errors.length > 0) {
  console.error("Security environment check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Security environment check passed.");
