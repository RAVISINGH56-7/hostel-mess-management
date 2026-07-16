"use client";

import { useEffect, useState } from "react";

type BoardData = {
  totalStudents: number;
  activeWardens: number;
  mealStats: Array<{ label: string; served: number; total: number }>;
};

export default function HostelSnapshot() {
  const [data, setData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/board/today")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setData({
          totalStudents: 0,
          activeWardens: 0,
          mealStats: [
            { label: "Breakfast", served: 0, total: 0 },
            { label: "Lunch", served: 0, total: 0 },
            { label: "Snacks", served: 0, total: 0 },
            { label: "Dinner", served: 0, total: 0 },
          ],
        });
      });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-2xl border border-line bg-surface p-6 animate-pulse">
          <div className="h-4 bg-surface-2 rounded w-24 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-8 bg-surface-2 rounded" />
            <div className="h-8 bg-surface-2 rounded" />
          </div>
          <div className="mt-6 space-y-3 pt-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-surface-2 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-2xl border border-line bg-surface p-6 theme-sensitive-shadow transition-colors duration-300">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Hostel · Today
          </p>
          <span className="rounded-full bg-saffron-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-saffron">
            Live
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="font-display text-3xl">{data?.totalStudents || 0}</p>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
              Students
            </p>
          </div>
          <div>
            <p className="font-display text-3xl">{data?.activeWardens || 0}</p>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
              Wardens on duty
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t border-dashed border-line pt-5">
          {data?.mealStats.map((meal) => {
            const pct = Math.round((meal.served / meal.total) * 100);
            return (
              <div key={meal.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">{meal.label}</span>
                  <span className="font-mono text-ink-soft">
                    {meal.served}/{meal.total}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-2">
                  <div
                    className="h-1.5 rounded-full bg-curry"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-ink-soft">
        Wardens see this for their block; admins see it across every hostel.
      </p>
    </div>
  );
}