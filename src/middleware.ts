import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const secret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (() => {
    if (process.env.NODE_ENV === "production" && !isBuild) {
      throw new Error("AUTH_SECRET or NEXTAUTH_SECRET must be set in production.");
    }
    if (process.env.NODE_ENV === "production") {
      console.warn("AUTH_SECRET not set during build; using temporary fallback for build-time execution.");
    }
    return "dev-secret-change-in-production";
  })();

const protectedPaths: { path: string; roles: string[] }[] = [
  { path: "/dashboard/admin", roles: ["SUPER_ADMIN"] },
  { path: "/dashboard/warden", roles: ["WARDEN", "SUPER_ADMIN"] },
  { path: "/dashboard/student", roles: ["STUDENT"] },
  { path: "/scanner", roles: ["STAFF", "SUPER_ADMIN"] },
  { path: "/api/admin", roles: ["SUPER_ADMIN"] },
  { path: "/api/warden", roles: ["WARDEN", "SUPER_ADMIN"] },
  { path: "/api/student", roles: ["STUDENT"] },
  { path: "/api/scanner", roles: ["STAFF", "SUPER_ADMIN"] },
];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  if (
    pathname.startsWith("/api/student/forgot-password") ||
    pathname.startsWith("/api/student/reset-password")
  ) {
    return NextResponse.next();
  }

  const rule = protectedPaths.find((r) => pathname.startsWith(r.path));
  if (!rule) return NextResponse.next();

  const isProd = process.env.NODE_ENV === "production";
  const cookieName = isProd ? "__Host-next-auth.session-token" : "next-auth.session-token";
  const token = await getToken({ req: request, secret, cookieName });

  const secureResponse = (res: NextResponse) => {
    try {
      res.headers.set("X-Content-Type-Options", "nosniff");
      res.headers.set("X-Frame-Options", "DENY");
      res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      res.headers.set("Permissions-Policy", "geolocation=(), microphone=()");
      res.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
      );
      if (request.nextUrl.protocol === "https:") {
        res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
      }
    } catch {
      // ignore header set errors in middleware
    }
    return res;
  };

  if (!token) {
    const loginUrl =
      pathname.startsWith("/dashboard/student") || pathname.startsWith("/api/student")
        ? "/login/student"
        : "/login/staff-admin";
    return secureResponse(NextResponse.redirect(new URL(loginUrl, request.url)));
  }

  const userRole = token.role as string;
  if (!rule.roles.includes(userRole)) {
    if (pathname.startsWith("/api")) {
      const resp = new NextResponse("Forbidden", { status: 403 });
      return secureResponse(resp);
    }
    const fallback =
      userRole === "STUDENT"
        ? "/dashboard/student"
        : userRole === "WARDEN"
          ? "/dashboard/warden"
          : userRole === "SUPER_ADMIN"
            ? "/dashboard/admin"
            : "/";
    return secureResponse(NextResponse.redirect(new URL(fallback, request.url)));
  }

  return secureResponse(NextResponse.next());
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scanner/:path*",
    "/api/admin/:path*",
    "/api/warden/:path*",
    "/api/student/:path*",
    "/api/scanner/:path*",
  ],
};
