"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { CardSkeleton } from "@/components/Skeleton";
import { Coffee, Soup, Cookie, Moon, Edit3, Check, X } from "lucide-react";
import { toast } from "sonner";

type Meal = {
  id: string;
  meal: string;
  startTime: string;
  endTime: string;
  isLive: boolean;
};

const MEAL_ICONS: Record<string, typeof Coffee> = {
  BREAKFAST: Coffee,
  LUNCH: Soup,
  SNACKS: Cookie,
  DINNER: Moon,
};

export default function AdminMenuPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [savingMealId, setSavingMealId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/menu")
      .then((res) => res.json())
      .then((data) => {
        setMeals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const beginEdit = (meal: Meal) => {
    setEditingMealId(meal.id);
    setEditStartTime(meal.startTime);
    setEditEndTime(meal.endTime);
  };

  const cancelEdit = () => {
    setEditingMealId(null);
    setEditStartTime("");
    setEditEndTime("");
  };

  const validateTime = (time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

  const saveMealTime = async (mealId: string) => {
    if (!validateTime(editStartTime) || !validateTime(editEndTime)) {
      toast.error("Enter valid times using HH:mm format.");
      return;
    }

    const [sh, sm] = editStartTime.split(":").map(Number);
    const [eh, em] = editEndTime.split(":").map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    if (start >= end) {
      toast.error("Start time must be before end time.");
      return;
    }

    setSavingMealId(mealId);

    try {
      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: mealId, startTime: editStartTime, endTime: editEndTime }),
      });

      const response = await res.json();
      if (!res.ok) {
        throw new Error(response.error || "Unable to save meal time");
      }

      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const [sh, sm] = editStartTime.split(":").map(Number);
      const [eh, em] = editEndTime.split(":").map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      const isLive = nowMinutes >= start && nowMinutes <= end;

      setMeals((current) =>
        current.map((meal) =>
          meal.id === mealId
            ? {
                ...meal,
                startTime: editStartTime,
                endTime: editEndTime,
                isLive,
              }
            : meal
        )
      );
      toast.success("Meal time updated.");
      cancelEdit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save meal time.");
    } finally {
      setSavingMealId(null);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl text-ink">Today's Menu</h1>
        <p className="mt-1 text-ink-soft">Meal windows and their current status.</p>

        {loading ? (
          <div className="mt-8 grid gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : meals.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-ink-soft">
            No meal windows configured.
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {meals.map((meal) => {
              const Icon = MEAL_ICONS[meal.meal] || Coffee;
              const isEditing = editingMealId === meal.id;
              return (
                <div
                  key={meal.id}
                  className={`rounded-2xl border bg-surface p-6 transition-all ${
                    meal.isLive ? "border-curry/40" : "border-line"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          meal.isLive ? "bg-curry-soft text-curry" : "bg-surface-2 text-ink-soft"
                        }`}
                      >
                        <Icon size={22} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-display text-xl text-ink">
                          {meal.meal.charAt(0) + meal.meal.slice(1).toLowerCase()}
                        </p>
                        {isEditing ? (
                          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label className="flex items-center gap-2 font-mono text-sm text-ink-soft">
                              <span>Start</span>
                              <input
                                type="time"
                                value={editStartTime}
                                onChange={(e) => setEditStartTime(e.target.value)}
                                className="rounded-xl border border-line bg-ink px-3 py-2 text-sm text-ink"
                              />
                            </label>
                            <label className="flex items-center gap-2 font-mono text-sm text-ink-soft">
                              <span>End</span>
                              <input
                                type="time"
                                value={editEndTime}
                                onChange={(e) => setEditEndTime(e.target.value)}
                                className="rounded-xl border border-line bg-ink px-3 py-2 text-sm text-ink"
                              />
                            </label>
                          </div>
                        ) : (
                          <p className="font-mono text-sm text-ink-soft">
                            {meal.startTime} – {meal.endTime}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {meal.isLive ? (
                        <span className="flex items-center gap-2 rounded-full bg-curry-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-curry">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-curry pulse-dot" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-curry" />
                          </span>
                          Serving now
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-ink-soft">Scheduled</span>
                      )}
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveMealTime(meal.id)}
                              disabled={savingMealId === meal.id}
                              className="inline-flex items-center gap-2 rounded-xl bg-curry px-3 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                              <Check size={16} />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => beginEdit(meal)}
                            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2"
                          >
                            <Edit3 size={16} />
                            Edit time
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
