"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Eye, EyeOff, ChevronDown } from "lucide-react";
import LoginShell from "@/components/LoginShell";

type Role = "warden" | "admin";

export default function StaffAdminLoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>("admin");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      username: email,
      password,
      role,
      redirect: false,
    });

    if (!result?.ok || result?.error) {
      setError("Invalid credentials");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/session", { cache: "no-store" });
    const session = await res.json();
    if (session?.user?.role === "SUPER_ADMIN" && role === "admin") {
      router.push("/dashboard/admin");
    } else if (session?.user?.role === "WARDEN" && role === "warden") {
      router.push("/dashboard/warden");
    } else {
      await signOut({ redirect: false });
      setError(
        `This portal is for ${role === "admin" ? "admin" : "warden"} accounts only.`
      );
      setLoading(false);
      return;
    }
    router.refresh();
  };

  return (
    <LoginShell
      accent="saffron"
      icon={<ShieldCheck size={20} strokeWidth={1.5} />}
      portalTitle="Admin & Warden"
      portalSubtitle="Register students, manage warden accounts, and track meal-wise consumption across the hostel in real time."
      formTitle="Staff Login"
      formSubtitle="Select your role and sign in to access administrative controls."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role selector */}
        <div className="space-y-1.5">
          <label
            htmlFor="role"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft"
          >
            Role
          </label>
          <div className="relative">
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full appearance-none rounded-lg bg-surface-2 border border-line px-4 py-3 pr-10 text-ink font-mono text-sm focus:outline-none focus:border-saffron/60 focus:ring-2 focus:ring-saffron/10 transition-all cursor-pointer"
            >
              <option value="admin">Admin</option>
              <option value="warden">Warden</option>
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.5}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@gmail.com"
            required
            autoComplete="email"
            className="w-full rounded-lg bg-surface-2 border border-line px-4 py-3 text-ink placeholder:text-ink-soft/40 font-mono text-sm focus:outline-none focus:border-saffron/60 focus:ring-2 focus:ring-saffron/10 transition-all"
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
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-lg bg-surface-2 border border-line px-4 py-3 pr-11 text-ink placeholder:text-ink-soft/40 font-mono text-sm focus:outline-none focus:border-saffron/60 focus:ring-2 focus:ring-saffron/10 transition-all"
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
          className="w-full mt-2 rounded-lg bg-saffron text-[#101713] font-semibold py-3 text-sm transition-all hover:bg-saffron/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="inline-block h-4 w-4 rounded-full border-2 border-[#101713]/25 border-t-[#101713] animate-spin" />
          )}
          {loading
            ? "Signing in…"
            : `Sign in as ${role === "admin" ? "Admin" : "Warden"}`}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Looking for the student portal?{" "}
        <Link href="/login/student" className="text-ink underline hover:text-saffron transition-colors">
          Sign in here
        </Link>{" "}
        ·{" "}
        <Link href="/login/staff" className="text-ink underline hover:text-saffron transition-colors">
          Staff scanner
        </Link>
      </p>
    </LoginShell>
  );
}
