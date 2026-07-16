"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { StatCardSkeleton } from "@/components/Skeleton";
import { Users, UtensilsCrossed } from "lucide-react";

type Snapshot = {
  totalStudents: number;
  mealsServedToday: number;
};

export default function WardenDashboard() {
  const [stats, setStats] = useState<Snapshot | null>(null);

  useEffect(() => {
    fetch("/api/warden/snapshot")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => console.error('Failed to fetch snapshot'));
  }, []);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl text-ink">Block Snapshot</h1>
        <p className="mt-1 text-ink-soft">Today's overview for your block.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {!stats ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-curry/30">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Active Students</p>
                  <Users size={18} className="text-curry" />
                </div>
                <p className="mt-3 font-display text-4xl">{stats.totalStudents}</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brick/30">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Meals Served Today</p>
                  <UtensilsCrossed size={18} className="text-brick" />
                </div>
                <p className="mt-3 font-display text-4xl">{stats.mealsServedToday}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
