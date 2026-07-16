"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import LoginShell from "@/components/LoginShell";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/student/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/login/student"), 2000);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-brick/30 bg-brick-soft p-4 text-sm text-brick">
          Missing reset token. Please use the link from your reset email.
        </div>
        <Link
          href="/login/student/forgot-password"
          className="block w-full rounded-lg bg-curry text-white font-semibold py-3 text-sm text-center transition-all hover:bg-curry/90 active:scale-[0.98]"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-curry/30 bg-curry-soft p-4 text-sm text-curry">
          Password reset successfully! Redirecting you to sign in…
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft"
        >
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          required
          autoComplete="new-password"
          className="w-full rounded-lg bg-surface-2 border border-line px-4 py-3 text-ink placeholder:text-ink-soft/40 font-mono text-sm focus:outline-none focus:border-curry/60 focus:ring-2 focus:ring-curry/10 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="block font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your new password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg bg-surface-2 border border-line px-4 py-3 text-ink placeholder:text-ink-soft/40 font-mono text-sm focus:outline-none focus:border-curry/60 focus:ring-2 focus:ring-curry/10 transition-all"
        />
      </div>

      {error && <p className="text-sm text-brick">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 rounded-lg bg-curry text-white font-semibold py-3 text-sm transition-all hover:bg-curry/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <LoginShell
      accent="curry"
      icon={<GraduationCap size={20} strokeWidth={1.5} />}
      portalTitle="Student Portal"
      portalSubtitle="Almost there — choose a strong password to finish resetting your account."
      formTitle="Set New Password"
      formSubtitle="Enter your new password below."
    >
      <Suspense
        fallback={
          <div className="text-sm text-ink-soft">Loading…</div>
        }
      >
        <ResetForm />
      </Suspense>
    </LoginShell>
  );
}
