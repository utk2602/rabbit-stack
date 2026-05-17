import { NextRequest } from "next/server";

function configuredOrigins() {
  return [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
    process.env.WEBHOOK_URL,
  ]
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value as string).origin;
      } catch {
        return null;
      }
    })
    .filter((value): value is string => Boolean(value));
}

export function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  const allowedOrigins = configuredOrigins();
  if (allowedOrigins.length === 0) {
    return true;
  }

  return allowedOrigins.includes(origin);
}
