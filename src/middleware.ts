import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET or NEXTAUTH_SECRET must be set in production."
      );
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

  // Public password reset endpoints (no auth required)
  if (
    pathname === "/api/student/forgot-password" ||
    pathname === "/api/student/reset-password"
  ) {
    return NextResponse.next();
  }

  const rule = protectedPaths.find((r) => pathname.startsWith(r.path));
  if (!rule) return NextResponse.next();

  const token = await getToken({ req: request, secret });

  // helper to set security headers on every response
  const secureResponse = (res: ReturnType<typeof NextResponse.next | typeof NextResponse.redirect>) => {
    try {
      res.headers.set("X-Content-Type-Options", "nosniff");
      res.headers.set("X-Frame-Options", "DENY");
      res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      res.headers.set("Permissions-Policy", "geolocation=(), microphone=()");
      res.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'"
      );
      // Only set HSTS when running on production domain (avoid in dev http)
      if (request.nextUrl.protocol === "https:") {
        res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
      }
    } catch {
      // ignore header set errors in middleware
    }
    return res;
  };

  if (!token) {
    const loginUrl = pathname.startsWith("/dashboard/student") || pathname.startsWith("/api/student")
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