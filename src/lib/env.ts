export function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file.`
    );
  }
  return value;
}

export function getSiteUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  throw new Error(
    "Missing NEXTAUTH_URL or VERCEL_URL in environment variables. Please set NEXTAUTH_URL for production deployments."
  );
}

export function getQrSecret(): string {
  if (process.env.QR_SECRET) {
    return process.env.QR_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("QR_SECRET must be set in production");
  }
  console.warn("WARNING: QR_SECRET not set. Using insecure dev fallback.");
  return "dev-secret-change-in-production";
}

// src/lib/env.ts
export function getResetTokenSecret(): string {
  const secret = process.env.RESET_TOKEN_SECRET;
  if (!secret) {
    throw new Error("RESET_TOKEN_SECRET is not defined in environment variables");
  }
  return secret;
}