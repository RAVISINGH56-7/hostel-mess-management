"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type AnalyticsData = {
  day: string;
  breakfast: number;
  lunch: number;
  snacks: number;
  dinner: number;
}[];

export default function WardenAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>([]);

  useEffect(() => {
    fetch("/api/warden/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch(() => console.error('Failed to fetch analytics'));
  }, []);

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl text-ink">Meal Analytics</h1>
        <p className="mt-2 text-ink-soft">Weekly consumption for your block.</p>
        <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                <XAxis dataKey="day" stroke="var(--color-ink-soft)" />
                <YAxis stroke="var(--color-ink-soft)" />
                <Tooltip />
                <Bar dataKey="breakfast" fill="var(--color-saffron)" />
                <Bar dataKey="lunch" fill="var(--color-curry)" />
                <Bar dataKey="snacks" fill="var(--color-brick)" />
                <Bar dataKey="dinner" fill="var(--color-ink)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-ink-soft">No data yet.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}