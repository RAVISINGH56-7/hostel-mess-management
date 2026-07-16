"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { ClipboardList } from "lucide-react";

type MealScan = {
  id: string;
  meal: string;
  date: string;
  status: string;
  scannedAt: string;
};

export default function StudentHistoryPage() {
  const [history, setHistory] = useState<MealScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/me/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl text-ink">Meal History</h1>
        <p className="mt-1 text-ink-soft">Your past 90 days of meals.</p>

        {loading ? (
          <div className="mt-8">
            <TableSkeleton rows={6} />
          </div>
        ) : history.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={ClipboardList}
              title="No meal history yet"
              description="Your scanned meals will appear here once the mess staff scans your QR pass."
            />
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr>
                  <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Date</th>
                  <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Meal</th>
                  <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Time</th>
                  <th className="px-6 py-3 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {history.map((scan) => (
                  <tr key={scan.id} className="transition-colors hover:bg-surface-2/50">
                    <td className="px-6 py-4 font-mono text-ink">
                      {new Date(scan.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 capitalize text-ink">
                      {scan.meal.toLowerCase()}
                    </td>
                    <td className="px-6 py-4 font-mono text-ink-soft">
                      {new Date(scan.scannedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-mono text-xs uppercase tracking-wider ${
                          scan.status === "SUCCESS" ? "text-curry" : "text-brick"
                        }`}
                      >
                        {scan.status === "SUCCESS" ? "Logged" : "Duplicate"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
