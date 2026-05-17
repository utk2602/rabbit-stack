import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function internalServerError(message = "Internal server error") {
  return jsonError(message, 500);
}
