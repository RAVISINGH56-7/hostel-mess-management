"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import { TableSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { Search, Users, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Student = {
  id: string;
  room: string;
  rollNumber?: string | null;
  course: string;
  semester: number;
  diet: string | null;
  passId: string;
  status: string;
  user: { name: string; email?: string; phone?: string };
};

export default function WardenStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      const res = await fetch(`/api/warden/students?${params}`);
      const data = await res.json();
      setStudents(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const courses = [...new Set(students.map((s) => s.course))];

  const filtered = students.filter((s) => {
    if (courseFilter && s.course !== courseFilter) return false;
    if (semesterFilter && s.semester !== parseInt(semesterFilter)) return false;
    return true;
  });

  const handleToggleStatus = async (student: Student) => {
    const newStatus = student.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/warden/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`${student.user.name} ${newStatus === "ACTIVE" ? "activated" : "suspended"}`);
        fetchStudents();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update status");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-ink">Students</h1>
            <p className="text-ink-soft mt-1">Manage your block's student roster</p>
          </div>
          <Link
            href="/dashboard/warden/students/new"
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            Add Student
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              placeholder="Search by name, room, or course..."
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
          <TableSkeleton rows={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search || courseFilter || semesterFilter ? "No students match your filters" : "No students yet"}
            description="Register a new student to get started."
            action={
              <Link
                href="/dashboard/warden/students/new"
                className="rounded-xl bg-ink px-5 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90"
              >
                Add Student
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Name</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Room</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Course</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Sem</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Diet</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Status</th>
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-surface-2/50">
                    <td className="px-5 py-4 font-medium text-ink">{s.user.name}</td>
                    <td className="px-5 py-4 font-mono text-ink-soft">{s.room}</td>
                    <td className="px-5 py-4 text-ink">{s.course}</td>
                    <td className="px-5 py-4 font-mono text-ink-soft">Sem {s.semester}</td>
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
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(s)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                          s.status === "ACTIVE"
                            ? "bg-brick/10 text-brick hover:bg-brick/20"
                            : "bg-curry-soft text-curry hover:bg-curry/20"
                        }`}
                        title={s.status === "ACTIVE" ? "Suspend student" : "Activate student"}
                      >
                        {s.status === "ACTIVE" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {s.status === "ACTIVE" ? "Suspend" : "Activate"}
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
