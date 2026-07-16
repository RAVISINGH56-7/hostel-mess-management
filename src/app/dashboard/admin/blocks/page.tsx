"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";

type Block = {
  id: string;
  name: string;
  hostel: { name: string };
};

export default function AdminBlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    fetch("/api/admin/blocks")
      .then((res) => res.json())
      .then(setBlocks)
      .catch(() => console.error('Failed to fetch blocks'));
  }, []);

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl text-ink">Blocks</h1>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map((block) => (
            <div key={block.id} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl">{block.name}</h3>
              <p className="text-ink-soft text-sm">Hostel: {block.hostel.name}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}