"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";

const NAV_LINKS: Record<string, { href: string; label: string }[]> = {
  STUDENT: [
    { href: "/dashboard/student", label: "Mess Pass" },
    { href: "/dashboard/student/history", label: "History" },
  ],
  WARDEN: [
    { href: "/dashboard/warden", label: "Snapshot" },
    { href: "/dashboard/warden/students", label: "Students" },
    { href: "/dashboard/warden/analytics", label: "Analytics" },
  ],
  SUPER_ADMIN: [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin/wardens", label: "Wardens" },
    { href: "/dashboard/admin/staff", label: "Staff" },
    { href: "/dashboard/admin/blocks", label: "Blocks" },
    { href: "/dashboard/admin/analytics", label: "Analytics" },
    { href: "/dashboard/admin/students", label: "Students" },
    { href: "/dashboard/admin/menu", label: "Menu" },
  ],
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const links = role ? (NAV_LINKS[role] || []) : [];

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-ink-soft">Loading session…</p>
      </div>
    );
  }

  const roleLabel = role === "SUPER_ADMIN" ? "Admin" : role.charAt(0) + role.slice(1).toLowerCase();

  const sidebar = (
    <aside className="flex h-full w-full flex-col bg-surface">
      <div className="flex items-center justify-between border-b border-line p-6">
        <div>
          <Link href="/" className="font-display text-xl tracking-tight text-ink">
            Tiffin
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft mt-1">
            {roleLabel}
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-ink-soft hover:text-ink lg:hidden"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setSidebarOpen(false)}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-ink text-surface"
                : "text-ink-soft hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-line p-4">
        <button
          onClick={() => signOut()}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r border-line lg:block">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72">{sidebar}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-ink-soft hover:text-ink lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="font-mono text-xs text-ink-soft">
              Welcome, {session?.user?.name || "User"}
            </span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 bg-bg p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}