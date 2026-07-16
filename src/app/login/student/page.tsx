"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import LoginShell from "@/components/LoginShell";

export default function StudentLoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid username or password");
      setLoading(false);
    } else {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (session?.user?.role === "STUDENT") {
        router.push("/dashboard/student");
        router.refresh();
      } else {
        await signOut({ redirect: false });
        setError(
          "This portal is for students only. Use the admin & warden sign in."
        );
        setLoading(false);
      }
    }
  };

  return (
    <LoginShell
      accent="curry"
      icon={<GraduationCap size={20} strokeWidth={1.5} />}
      portalTitle="Student Portal"
      portalSubtitle="View your meal schedule, personal QR pass, and complete attendance history—all in one place."
      formTitle="Student Login"
      formSubtitle="Enter your roll number and password to continue."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Roll number */}
        <div className="space-y-1.5">
          <label
            htmlFor="roll"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft"
          >
            Roll Number
          </label>
          <input
            id="roll"
            name="username"
            type="text"
            placeholder="e.g. 27600122064"
            required
            autoComplete="username"
            className="w-full rounded-lg bg-surface-2 border border-line px-4 py-3 text-ink placeholder:text-ink-soft/40 font-mono text-sm focus:outline-none focus:border-curry/60 focus:ring-2 focus:ring-curry/10 transition-all"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft"
            >
              Password
            </label>
            <Link
              href="/login/student/forgot-password"
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft hover:text-curry transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-lg bg-surface-2 border border-line px-4 py-3 pr-11 text-ink placeholder:text-ink-soft/40 font-mono text-sm focus:outline-none focus:border-curry/60 focus:ring-2 focus:ring-curry/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors p-0.5"
            >
              {showPw ? (
                <EyeOff size={15} strokeWidth={1.5} />
              ) : (
                <Eye size={15} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-brick">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-lg bg-curry text-white font-semibold py-3 text-sm transition-all hover:bg-curry/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          )}
          {loading ? "Signing in…" : "Sign in to Student Portal"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Not a student?{" "}
        <Link href="/login/staff-admin" className="text-ink underline hover:text-curry transition-colors">
          Admin & warden sign in
        </Link>{" "}
        ·{" "}
        <Link href="/login/staff" className="text-ink underline hover:text-curry transition-colors">
          Staff scanner
        </Link>
      </p>
    </LoginShell>
  );
}
