"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { CardSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { Plus, Trash2, Search, ScanLine } from "lucide-react";
import { toast } from "sonner";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  block?: { id: string; name: string };
};

type Block = {
  id: string;
  name: string;
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filtered, setFiltered] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    blockId: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadStaff();
    loadBlocks();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(staff);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      staff.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      )
    );
  }, [search, staff]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      setStaff(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlocks = async () => {
    try {
      const res = await fetch("/api/admin/blocks");
      const data = await res.json();
      setBlocks(data);
    } catch (error) {
      console.error("Error loading blocks:", error);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Staff member created successfully");
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          blockId: "",
        });
        setShowForm(false);
        loadStaff();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error creating staff member");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/staff?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Staff member deleted");
        loadStaff();
      } else {
        toast.error("Error deleting staff member");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-ink">Staff</h1>
            <p className="mt-1 text-ink-soft">Manage scanning staff</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            <Plus size={18} />
            Add Staff
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-curry focus:outline-none"
          />
        </div>

        {showForm && (
          <div className="mb-8 rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl mb-4">Add New Staff</h2>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface placeholder:text-surface/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface placeholder:text-surface/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">Block (optional)</label>
                  <select
                    value={formData.blockId}
                    onChange={(e) => setFormData({ ...formData, blockId: e.target.value })}
                    className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface"
                  >
                    <option value="">All blocks</option>
                    {blocks.map((block) => (
                      <option key={block.id} value={block.id}>{block.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {formLoading ? "Creating..." : "Create Staff"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); }}
                  className="rounded-xl border border-line px-6 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ScanLine}
            title={search ? "No staff match your search" : "No staff yet"}
            description={search ? "Try a different search term." : "Add scanning staff to get started."}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="group rounded-2xl border border-line bg-surface p-6 transition-all hover:border-brick/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brick-soft text-lg font-bold text-brick">
                    {s.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg text-ink truncate">{s.name}</h3>
                    <p className="truncate text-xs text-ink-soft">{s.email}</p>
                    {s.phone && <p className="text-xs text-ink-soft">{s.phone}</p>}
                    {s.block && (
                      <p className="mt-2 inline-block rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                        {s.block.name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteStaff(s.id, s.name)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brick/10 px-3 py-2.5 text-sm text-brick transition-colors hover:bg-brick/20"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
