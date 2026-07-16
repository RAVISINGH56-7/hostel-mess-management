"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import { TableSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";

type Student = {
  id: string;
  room: string;
  course: string;
  semester: number;
  diet: string | null;
  status: string;
  user: { name: string; email: string | null; phone: string | null };
  block: { name: string };
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [courses, setCourses] = useState<string[]>([]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (courseFilter) params.set("course", courseFilter);
      if (semesterFilter) params.set("semester", semesterFilter);
      const res = await fetch(`/api/admin/students?${params}`);
      const data = await res.json();
      setStudents(data.students || []);
      if (data.filters?.courses) setCourses(data.filters.courses);
    } catch {
      console.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [search, courseFilter, semesterFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl text-ink">All Students</h1>
        <p className="mt-1 text-ink-soft">View and manage students across all blocks.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              placeholder="Search by name, room, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-curry focus:outline-none"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-curry focus:outline-none"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-curry focus:outline-none"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Sem {s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="mt-6">
            <TableSkeleton rows={8} />
          </div>
        ) : students.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={Users}
              title="No students found"
              description="Try a different search term or filter."
            />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Name</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Room</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Course</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Sem</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Diet</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Block</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Status</th>
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {students.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-surface-2/50">
                    <td className="px-5 py-4 font-medium text-ink">{s.user.name}</td>
                    <td className="px-5 py-4 font-mono text-ink-soft">{s.room}</td>
                    <td className="px-5 py-4 text-ink">{s.course}</td>
                    <td className="px-5 py-4 font-mono text-ink-soft">{s.semester}</td>
                    <td className="px-5 py-4">
                      {s.diet ? (
                        <span className={`font-mono text-[11px] uppercase tracking-wider ${s.diet === "VEG" ? "text-curry" : "text-brick"}`}>
                          {s.diet === "VEG" ? "Veg" : "Non-Veg"}
                        </span>
                      ) : (
                        <span className="text-ink-soft/50">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-[11px] text-ink-soft">
                        {s.block.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${
                          s.status === "ACTIVE"
                            ? "bg-curry-soft text-curry"
                            : "bg-brick-soft text-brick"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Delete student "${s.user.name}"? This cannot be undone.`)) return;
                          try {
                            const res = await fetch(`/api/admin/students?id=${s.id}`, { method: "DELETE" });
                            if (res.ok) {
                              toast.success("Student deleted");
                              fetchStudents();
                            } else {
                              toast.error("Error deleting student");
                            }
                          } catch {
                            toast.error("Network error");
                          }
                        }}
                        className="rounded-lg bg-brick/10 px-3 py-1.5 text-xs text-brick transition-colors hover:bg-brick/20"
                      >
                        Delete
                      </button>
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