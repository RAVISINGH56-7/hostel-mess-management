"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { CardSkeleton } from "@/components/Skeleton";
import { Coffee, Soup, Cookie, Moon } from "lucide-react";

type Meal = {
  id: string;
  meal: string;
  startTime: string;
  endTime: string;
  isLive: boolean;
};

const MEAL_ICONS: Record<string, typeof Coffee> = {
  BREAKFAST: Coffee,
  LUNCH: Soup,
  SNACKS: Cookie,
  DINNER: Moon,
};

export default function AdminMenuPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/menu")
      .then((res) => res.json())
      .then((data) => {
        setMeals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl text-ink">Today's Menu</h1>
        <p className="mt-1 text-ink-soft">Meal windows and their current status.</p>

        {loading ? (
          <div className="mt-8 grid gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : meals.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-ink-soft">
            No meal windows configured.
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {meals.map((meal) => {
              const Icon = MEAL_ICONS[meal.meal] || Coffee;
              return (
                <div
                  key={meal.id}
                  className={`rounded-2xl border bg-surface p-6 transition-all ${
                    meal.isLive ? "border-curry/40" : "border-line"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          meal.isLive ? "bg-curry-soft text-curry" : "bg-surface-2 text-ink-soft"
                        }`}
                      >
                        <Icon size={22} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-display text-xl text-ink">
                          {meal.meal.charAt(0) + meal.meal.slice(1).toLowerCase()}
                        </p>
                        <p className="font-mono text-sm text-ink-soft">
                          {meal.startTime} – {meal.endTime}
                        </p>
                      </div>
                    </div>
                    {meal.isLive && (
                      <span className="flex items-center gap-2 rounded-full bg-curry-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-curry">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-curry pulse-dot" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-curry" />
                        </span>
                        Serving now
                      </span>
                    )}
                    {!meal.isLive && (
                      <span className="font-mono text-xs text-ink-soft">Scheduled</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
