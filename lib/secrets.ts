import crypto from "crypto";
import { getSecretEncryptionKey } from "./security-env";

const ENCRYPTED_PREFIX = "enc:v1:";
const ALGORITHM = "aes-256-gcm";

export function isEncryptedSecret(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(ENCRYPTED_PREFIX);
}

export function encryptSecret(value: string): string {
  if (!value) {
    return value;
  }

  const key = getSecretEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTED_PREFIX.slice(0, -1),
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
}

export function decryptSecret(value: string): string {
  if (!isEncryptedSecret(value)) {
    return value;
  }

  const [prefix, version, ivValue, authTagValue, ciphertextValue] =
    value.split(":");
  if (
    prefix !== "enc" ||
    version !== "v1" ||
    !ivValue ||
    !authTagValue ||
    !ciphertextValue
  ) {
    throw new Error("Invalid encrypted secret format");
  }

  const key = getSecretEncryptionKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivValue, "base64url")
  );

  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function decryptOptionalSecret(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  return decryptSecret(value);
}

export function redactSecret(value: string | null | undefined): string {
  if (!value) {
    return "[empty]";
  }

  if (value.length <= 8) {
    return "[redacted]";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
