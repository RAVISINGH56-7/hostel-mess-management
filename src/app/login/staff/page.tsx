"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScanLine } from "lucide-react";
import LoginShell from "@/components/LoginShell";

export default function StaffLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

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
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials");
      setLoading(false);
    } else {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (session?.user?.role === "STAFF") {
        router.push("/scanner");
      } else if (session?.user?.role === "SUPER_ADMIN") {
        router.push("/dashboard/admin");
      } else {
        setError("Access denied. Use the admin/warden portal instead.");
        setLoading(false);
      }
      router.refresh();
    }
  };

  return (
    <LoginShell
      accent="brick"
      icon={<ScanLine size={20} strokeWidth={1.5} />}
      portalTitle="Staff Scanner"
      portalSubtitle="Open the camera, scan a student's QR pass at the counter, and log any meal in one tap."
      formTitle="Scanner Login"
      formSubtitle="Enter your staff email and password to open the scanner."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="w-full rounded-lg bg-surface-2 border border-line px-4 py-3 text-ink placeholder:text-ink-soft/40 font-mono text-sm focus:outline-none focus:border-brick/60 focus:ring-2 focus:ring-brick/10 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            required
            autoComplete="current-password"
            className="w-full rounded-lg bg-surface-2 border border-line px-4 py-3 text-ink placeholder:text-ink-soft/40 font-mono text-sm focus:outline-none focus:border-brick/60 focus:ring-2 focus:ring-brick/10 transition-all"
          />
        </div>

        {error && <p className="text-sm text-brick">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-lg bg-brick text-white font-semibold py-3 text-sm transition-all hover:bg-brick/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          )}
          {loading ? "Unlocking Scanner…" : "Open Scanner"}
        </button>

        <p className="text-center font-mono text-[10px] text-ink-soft/50 uppercase tracking-[0.15em] pt-0.5">
          Contact admin if you've forgotten your password
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Not a staff member?{" "}
        <Link href="/login/staff-admin" className="text-ink underline hover:text-brick transition-colors">
          Admin & warden portal
        </Link>{" "}
        ·{" "}
        <Link href="/login/student" className="text-ink underline hover:text-brick transition-colors">
          Student portal
        </Link>
      </p>
    </LoginShell>
  );
}
