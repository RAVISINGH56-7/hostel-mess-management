"use client";

import { useEffect, useState } from "react";

type MealKey = "breakfast" | "lunch" | "snacks" | "dinner";

type MealWindow = {
  key: MealKey;
  label: string;
  start: string; // "HH:MM" 24h
  end: string;
};

const MEALS: MealWindow[] = [
  { key: "breakfast", label: "Breakfast", start: "08:00", end: "09:30" },
  { key: "lunch", label: "Lunch", start: "12:30", end: "14:30" },
  { key: "snacks", label: "Snacks", start: "17:00", end: "19:00" },
  { key: "dinner", label: "Dinner", start: "20:00", end: "22:00" },
];

type Status = "serving" | "upcoming" | "closed";

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getStatus(meal: MealWindow, nowMinutes: number): Status {
  const start = toMinutes(meal.start);
  const end = toMinutes(meal.end);
  if (nowMinutes >= start && nowMinutes <= end) return "serving";
  if (nowMinutes < start) return "upcoming";
  return "closed";
}

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

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const nowMinutes = now ? now.getHours() * 60 + now.getMinutes() : 0;

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
        {MEALS.map((meal, i) => {
          const status = now ? getStatus(meal, nowMinutes) : "upcoming";
          const meta = STATUS_META[status];
          return (
            <li
              key={meal.key}
              className="flap-in flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-300"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-lg italic text-surface/40">
                  0{i + 1}
                </span>
                <span className="font-display text-xl tracking-wide">
                  {meal.label}
                </span>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs tabular-nums text-surface/50">
                  {meal.start} – {meal.end}
                </p>
                <p
                  className={`mt-0.5 flex items-center justify-end gap-1.5 font-mono text-xs uppercase tracking-[0.15em] ${meta.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                  {status === "upcoming" ? ` ${meal.start}` : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-surface/10 px-5 py-3">
        <p className="font-mono text-[11px] text-surface/40">
          Updates the instant staff scan a student&rsquo;s tray-side QR.
        </p>
      </div>
    </div>
  );
}