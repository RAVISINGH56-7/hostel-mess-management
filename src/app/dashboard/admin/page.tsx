"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { StatCardSkeleton } from "@/components/Skeleton";
import { Users, ShieldCheck, Building2, UtensilsCrossed } from "lucide-react";

type Snapshot = {
  totalStudents: number;
  totalWardens: number;
  totalBlocks: number;
  mealsServedToday: number;
};

export default function AdminDashboard() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    fetch("/api/admin/snapshot")
      .then((res) => res.json())
      .then(setSnapshot)
      .catch(() => console.error('Failed to load snapshot'));
  }, []);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl text-ink">Admin Overview</h1>
        <p className="mt-1 text-ink-soft">Live snapshot across all blocks.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {!snapshot ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-curry/30">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Total Students</p>
                  <Users size={18} className="text-curry" />
                </div>
                <p className="mt-3 font-display text-4xl">{snapshot.totalStudents}</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-saffron/30">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Wardens</p>
                  <ShieldCheck size={18} className="text-saffron" />
                </div>
                <p className="mt-3 font-display text-4xl">{snapshot.totalWardens}</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-curry/30">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Blocks</p>
                  <Building2 size={18} className="text-curry" />
                </div>
                <p className="mt-3 font-display text-4xl">{snapshot.totalBlocks}</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brick/30">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Meals Today</p>
                  <UtensilsCrossed size={18} className="text-brick" />
                </div>
                <p className="mt-3 font-display text-4xl">{snapshot.mealsServedToday}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
