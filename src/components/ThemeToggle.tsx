"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-8 w-8" />;

  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group rounded-full p-2 text-ink-soft transition-all duration-300 hover:text-ink"
      aria-label="Toggle theme"
    >
      <Icon
        size={18}
        className="transition-transform duration-500 group-hover:scale-110 group-active:rotate-180"
      />
    </button>
  );
}
