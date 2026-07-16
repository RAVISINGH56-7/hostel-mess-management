"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { CardSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { Plus, Trash2, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Warden = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  block?: { name: string };
};

type Block = {
  id: string;
  name: string;
};

export default function AdminWardensPage() {
  const [wardens, setWardens] = useState<Warden[]>([]);
  const [filtered, setFiltered] = useState<Warden[]>([]);
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
    photo: null as File | null,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadWardens();
    loadBlocks();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(wardens);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      wardens.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.email.toLowerCase().includes(q)
      )
    );
  }, [search, wardens]);

  const loadWardens = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/wardens");
      const data = await res.json();
      setWardens(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error loading wardens:", error);
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

  const handleAddWarden = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("phone", formData.phone);
    form.append("password", formData.password);
    form.append("blockId", formData.blockId);
    if (formData.photo) {
      form.append("photo", formData.photo);
    }

    try {
      const res = await fetch("/api/admin/wardens", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        toast.success("Warden created successfully");
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          blockId: "",
          photo: null,
        });
        setPhotoPreview(null);
        setShowForm(false);
        loadWardens();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error creating warden");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteWarden = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/wardens?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Warden deleted");
        loadWardens();
      } else {
        toast.error("Error deleting warden");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-ink">Wardens</h1>
            <p className="mt-1 text-ink-soft">Manage hostel wardens</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            <Plus size={18} />
            Add Warden
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            placeholder="Search wardens by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-curry focus:outline-none"
          />
        </div>

        {showForm && (
          <div className="mb-8 rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl mb-4">Add New Warden</h2>
            <form onSubmit={handleAddWarden} className="space-y-4">
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
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">Block *</label>
                  <select
                    required
                    value={formData.blockId}
                    onChange={(e) => setFormData({ ...formData, blockId: e.target.value })}
                    className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface"
                  >
                    <option value="">Select a block</option>
                    {blocks.map((block) => (
                      <option key={block.id} value={block.id}>{block.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-1 file:text-xs file:text-ink-soft"
                  />
                </div>
              </div>
              {photoPreview && (
                <Image
                  src={photoPreview}
                  alt="Preview"
                  width={128}
                  height={128}
                  unoptimized
                  className="h-32 w-32 rounded-xl object-cover"
                />
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {formLoading ? "Creating..." : "Create Warden"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setPhotoPreview(null); }}
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
            icon={ShieldCheck}
            title={search ? "No wardens match your search" : "No wardens yet"}
            description={search ? "Try a different search term." : "Add your first warden to get started."}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((warden) => (
              <div
                key={warden.id}
                className="group rounded-2xl border border-line bg-surface p-6 transition-all hover:border-curry/30"
              >
                <div className="flex items-start gap-4">
                  {warden.photoUrl ? (
                    <Image
                      src={warden.photoUrl}
                      alt={warden.name}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-lg font-bold text-ink-soft">
                      {warden.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg text-ink truncate">{warden.name}</h3>
                    <p className="truncate text-xs text-ink-soft">{warden.email}</p>
                    {warden.phone && <p className="text-xs text-ink-soft">{warden.phone}</p>}
                    {warden.block && (
                      <p className="mt-2 inline-block rounded-full bg-curry-soft px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-curry">
                        {warden.block.name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteWarden(warden.id, warden.name)}
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
