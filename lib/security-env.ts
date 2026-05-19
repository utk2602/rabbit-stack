import crypto from "crypto";

export const REQUIRED_SECURITY_VARIABLES = [
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
] as const;

type SecurityEnv = Partial<Record<string, string | undefined>>;

function readEnvValue(env: SecurityEnv, name: string) {
  return env[name]?.trim();
}

export function parseSecretEncryptionKey(
  value = process.env.DATA_ENCRYPTION_KEY
) {
  if (!value) {
    return null;
  }

  const trimmedKey = value.trim();

  if (/^[a-f0-9]{64}$/i.test(trimmedKey)) {
    return Buffer.from(trimmedKey, "hex");
  }

  const base64Key = Buffer.from(trimmedKey, "base64");
  if (base64Key.length === 32) {
    return base64Key;
  }

  const utf8Key = Buffer.from(trimmedKey, "utf8");
  if (utf8Key.length === 32) {
    return utf8Key;
  }

  return null;
}

export function getSecretEncryptionKey() {
  const key = getSecretEncryptionKeys()[0];

  if (!key) {
    throw new Error(
      "DATA_ENCRYPTION_KEY must be 32 bytes as base64, hex, or UTF-8 text, or BETTER_AUTH_SECRET must be at least 32 characters"
    );
  }

  return key;
}

function deriveFallbackEncryptionKey(env: SecurityEnv = process.env) {
  const secret = readEnvValue(env, "BETTER_AUTH_SECRET");

  if (!secret || secret.length < 32) {
    return null;
  }

  return crypto
    .createHash("sha256")
    .update(`rabbit-stack:data-encryption:v1:${secret}`)
    .digest();
}

export function getSecretEncryptionKeys(env: SecurityEnv = process.env) {
  const keys: Buffer[] = [];
  const configuredKey = parseSecretEncryptionKey(
    readEnvValue(env, "DATA_ENCRYPTION_KEY")
  );
  const fallbackKey = deriveFallbackEncryptionKey(env);

  if (configuredKey) {
    keys.push(configuredKey);
  }

  if (fallbackKey && !keys.some((key) => key.equals(fallbackKey))) {
    keys.push(fallbackKey);
  }

  return keys;
}

export function hasValidSecretEncryptionKey(
  value = process.env.DATA_ENCRYPTION_KEY,
  env: SecurityEnv = process.env
) {
  return (
    parseSecretEncryptionKey(value) !== null ||
    deriveFallbackEncryptionKey(env) !== null
  );
}

function hasValidUrl(value: string | undefined) {
  if (!value) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function validateSecurityEnv(env: SecurityEnv = process.env) {
  const errors: string[] = [];
  const missing = REQUIRED_SECURITY_VARIABLES.filter(
    (name) => !readEnvValue(env, name)
  );

  if (missing.length > 0) {
    errors.push(`Missing required variables: ${missing.join(", ")}`);
  }

  const hasTokenEncryptionKey = hasValidSecretEncryptionKey(
    readEnvValue(env, "DATA_ENCRYPTION_KEY"),
    env
  );

  if (!hasTokenEncryptionKey) {
    errors.push(
      "DATA_ENCRYPTION_KEY must be 32 bytes as base64, hex, or UTF-8 text, or BETTER_AUTH_SECRET must be at least 32 characters."
    );
  }

  if ((readEnvValue(env, "BETTER_AUTH_SECRET")?.length ?? 0) < 32) {
    errors.push("BETTER_AUTH_SECRET should be at least 32 characters.");
  }

  for (const name of [
    "BETTER_AUTH_URL",
    "NEXT_PUBLIC_BETTER_AUTH_URL",
    "NEXT_PUBLIC_APP_URL",
    "WEBHOOK_URL",
  ]) {
    const value = readEnvValue(env, name);
    if (!hasValidUrl(value)) {
      errors.push(`${name} must be a valid URL.`);
    }
  }

  return errors;
}
