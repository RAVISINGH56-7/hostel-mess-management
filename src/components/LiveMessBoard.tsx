"use client";

import { useEffect, useState } from "react";
import {
  getMealLabel,
  getMealWindowStatus,
  getIstMinutesSinceMidnight,
} from "@/lib/mealWindows";

type MealWindow = {
  id: string;
  meal: string;
  startTime: string;
  endTime: string;
  isLive: boolean;
};

type Status = "serving" | "upcoming" | "closed";

const STATUS_META: Record<
  Status,
  { label: string; dot: string; text: string }
> = {
  serving: { label: "Serving now", dot: "bg-curry", text: "text-curry" },
  upcoming: { label: "Opens", dot: "bg-saffron", text: "text-saffron" },
  closed: { label: "Closed", dot: "bg-ink-soft/50", text: "text-ink-soft" },
};

export default function LiveMessBoard() {
  const [now, setNow] = useState<Date | null>(null);
  const [mealWindows, setMealWindows] = useState<MealWindow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadMealWindows() {
      try {
        const res = await fetch("/api/meal-windows");
        if (!res.ok) {
          throw new Error("Failed to load meal windows");
        }
        const data = await res.json();
        setMealWindows(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadMealWindows();
  }, []);

  const nowMinutes = getIstMinutesSinceMidnight(now ?? new Date());

  return (
    <div className="w-full rounded-2xl border border-line bg-ink text-surface theme-sensitive-shadow transition-colors duration-300">
      <div className="flex items-center justify-between border-b border-surface/10 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-curry pulse-dot" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-curry" />
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-surface/70">
            Today&rsquo;s mess board
          </p>
        </div>
        <p className="font-mono text-[11px] tabular-nums text-surface/50">
          {now
            ? now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--"}
        </p>
      </div>

      <ul className="divide-y divide-surface/10">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-4 px-5 py-4 opacity-50">
              <div className="h-5 w-32 rounded-full bg-surface-2" />
              <div className="h-4 w-20 rounded-full bg-surface-2" />
            </li>
          ))
        ) : mealWindows.length > 0 ? (
          mealWindows.map((window, i) => {
            const status = getMealWindowStatus(window, nowMinutes);
            const meta = STATUS_META[
              status === "ok" ? "serving" : status === "not_started" ? "upcoming" : "closed"
            ];
            return (
              <li
                key={window.id}
                className="flap-in flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-300"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-lg italic text-surface/40">
                    0{i + 1}
                  </span>
                  <span className="font-display text-xl tracking-wide">
                    {window.meal.charAt(0) + window.meal.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs tabular-nums text-surface/50">
                    {window.startTime} – {window.endTime}
                  </p>
                  <p
                    className={`mt-0.5 flex items-center justify-end gap-1.5 font-mono text-xs uppercase tracking-[0.15em] ${meta.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                    {status === "not_started" ? ` ${window.startTime}` : ""}
                  </p>
                </div>
              </li>
            );
          })
        ) : (
          <li className="px-5 py-6 text-center text-sm text-surface/70">
            Meal windows are not configured yet.
          </li>
        )}
      </ul>

      <div className="border-t border-surface/10 px-5 py-3">
        <p className="font-mono text-[11px] text-surface/40">
          Updates the instant staff scan a student&rsquo;s tray-side QR.
        </p>
      </div>
    </div>
  );
}