"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import LoginShell from "@/components/LoginShell";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;

    try {
      const res = await fetch("/api/student/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginShell
      accent="curry"
      icon={<GraduationCap size={20} strokeWidth={1.5} />}
      portalTitle="Student Portal"
      portalSubtitle="Forgot your password? Reset it here and get back to tracking your meals."
      formTitle="Forgot Password"
      formSubtitle="Enter your roll number or username to receive a reset link."
    >
      {sent ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-curry/30 bg-curry-soft p-4 text-sm text-curry">
            If an account exists with that username, a reset link has been
            logged to the server console. Check your terminal output.
          </div>
          <Link
            href="/login/student"
            className="block w-full rounded-lg bg-curry text-white font-semibold py-3 text-sm text-center transition-all hover:bg-curry/90 active:scale-[0.98]"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft"
            >
              Username / Roll Number
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="e.g. 2026BTCS0418"
              required
              autoComplete="username"
              className="w-full rounded-lg bg-surface-2 border border-line px-4 py-3 text-ink placeholder:text-ink-soft/40 font-mono text-sm focus:outline-none focus:border-curry/60 focus:ring-2 focus:ring-curry/10 transition-all"
            />
          </div>

          {error && <p className="text-sm text-brick">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-curry text-white font-semibold py-3 text-sm transition-all hover:bg-curry/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>

          <p className="text-center text-sm text-ink-soft">
            Remember your password?{" "}
            <Link href="/login/student" className="text-ink underline hover:text-curry transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </LoginShell>
  );
}
