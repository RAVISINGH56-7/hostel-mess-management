export function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file.`
    );
  }
  return value;
}

export function getQrSecret(): string {
  return process.env.QR_SECRET || (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("QR_SECRET must be set in production");
    }
    console.warn("WARNING: QR_SECRET not set. Using insecure dev fallback.");
    return "dev-secret-change-in-production";
  })();
}

// src/lib/env.ts
export function getResetTokenSecret(): string {
  const secret = process.env.RESET_TOKEN_SECRET;
  if (!secret) {
    throw new Error("RESET_TOKEN_SECRET is not defined in environment variables");
  }
  return secret;
}