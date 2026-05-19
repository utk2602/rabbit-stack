import type { BaseURLConfig } from "better-auth";

const DEFAULT_AUTH_ORIGIN = "http://localhost:3000";
const DEFAULT_ALLOWED_HOSTS = ["localhost:3000", "127.0.0.1:3000"];

function splitCsv(value: string | undefined) {
  return value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
}

function normalizeOrigin(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value.trim()).origin;
  } catch {
    return undefined;
  }
}

function getVercelOrigin() {
  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (!vercelUrl) {
    return undefined;
  }

  return normalizeOrigin(
    vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`
  );
}

function getHost(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.includes("*")) {
    return trimmed.replace(/^https?:\/\//, "").split("/")[0];
  }

  try {
    return new URL(
      trimmed.includes("://") ? trimmed : `https://${trimmed}`
    ).host;
  } catch {
    return trimmed;
  }
}

export function getAuthIssuerOrigin() {
  return (
    normalizeOrigin(process.env.BETTER_AUTH_URL) ??
    getVercelOrigin() ??
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
    DEFAULT_AUTH_ORIGIN
  );
}

export function getAuthAllowedHosts(fallbackOrigin = getAuthIssuerOrigin()) {
  const hosts = new Set(DEFAULT_ALLOWED_HOSTS);

  for (const origin of [
    fallbackOrigin,
    normalizeOrigin(process.env.BETTER_AUTH_URL),
    normalizeOrigin(process.env.NEXT_PUBLIC_BETTER_AUTH_URL),
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL),
    getVercelOrigin(),
  ]) {
    const host = getHost(origin);

    if (host) {
      hosts.add(host);
    }
  }

  for (const host of splitCsv(process.env.BETTER_AUTH_ALLOWED_HOSTS)) {
    const normalizedHost = getHost(host);

    if (normalizedHost) {
      hosts.add(normalizedHost);
    }
  }

  return [...hosts];
}

export function getAuthBaseURLConfig(): BaseURLConfig {
  const fallback = getAuthIssuerOrigin();

  return {
    allowedHosts: getAuthAllowedHosts(fallback),
    fallback,
    protocol: "auto",
  };
}
