"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-8 w-8" />;

  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group inline-flex items-center justify-center rounded-full border border-line bg-surface p-2 text-ink-soft shadow-sm transition duration-300 hover:border-curry hover:text-ink focus:outline-none focus:ring-2 focus:ring-curry/40"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
    >
      <Icon
        size={18}
        className="transition-transform duration-500 group-hover:scale-110 group-active:rotate-180"
      />
    </button>
  );
}
