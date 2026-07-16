"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type StudentData = {
  name: string;
  room: string;
  course: string;
  semester: number;
  passId: string;
  qrToken: string;
  photoUrl?: string;
  todayMeals: string[];
  status: string;
};

const ALL_MEALS = ["breakfast", "lunch", "snacks", "dinner"];

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function StudentDashboard() {
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    fetch("/api/student/me")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const onChangePassword = async (formData: PasswordForm) => {
    try {
      const res = await fetch("/api/student/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      if (res.ok) {
        toast.success("Password changed successfully");
        setShowPasswordForm(false);
        reset();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to change password");
      }
    } catch {
      toast.error("Network error");
    }
  };

  if (loading)
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-curry border-t-transparent" />
        </div>
      </DashboardShell>
    );
  if (!data)
    return (
      <DashboardShell>
        <div className="py-20 text-center text-ink-soft">Profile not found.</div>
      </DashboardShell>
    );

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-ink">Your Mess Pass</h1>
            <p className="mt-1 text-ink-soft">Your meal pass and today's status.</p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="rounded-xl border border-line bg-surface px-5 py-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* QR Pass Card */}
          <div className="coupon-notch rounded-2xl border border-line bg-surface p-6 theme-sensitive-shadow transition-colors">

            {/* Card header: photo + name + status */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {data.photoUrl ? (
                  <Image
                    src={data.photoUrl}
                    alt={data.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="h-12 w-12 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-curry-soft font-display text-xl font-bold text-curry">
                    {data.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Mess Pass</p>
                  <p className="font-display text-xl leading-tight">{data.name}</p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] ${
                  data.status === "ACTIVE"
                    ? "bg-curry-soft text-curry"
                    : "bg-brick-soft text-brick"
                }`}
              >
                {data.status}
              </span>
            </div>

            {/* QR Code — white background with black dots for universal scanner compatibility */}
            <div className="mt-5 flex items-center justify-center rounded-xl bg-white p-5">
              {data.qrToken ? (
                <QRCodeSVG
                  value={data.qrToken}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              ) : (
                <div className="flex h-[180px] w-[180px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-center text-xs text-gray-400 font-mono uppercase tracking-widest">
                    QR unavailable
                  </p>
                </div>
              )}
            </div>

            {/* Details */}
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-dashed border-line pt-4 font-mono text-xs">
              <div>
                <dt className="text-ink-soft">Room</dt>
                <dd className="mt-0.5 text-ink">{data.room}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Course</dt>
                <dd className="mt-0.5 text-ink">{data.course} · Sem {data.semester}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Pass ID</dt>
                <dd className="mt-0.5 text-ink">{data.passId}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Today</dt>
                <dd className="mt-0.5 text-curry">{data.todayMeals.length} / 4 meals scanned</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-6">
            {/* Today's Meals */}
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="font-display text-xl text-ink">Today's Meals</h2>
              <ul className="mt-4 space-y-3">
                {ALL_MEALS.map((meal) => {
                  const scanned = data.todayMeals.includes(meal);
                  return (
                    <li
                      key={meal}
                      className="flex items-center justify-between border-b border-dashed border-line py-2 last:border-0"
                    >
                      <span className="text-sm capitalize text-ink">{meal}</span>
                      <span
                        className={`font-mono text-xs uppercase ${
                          scanned ? "text-curry" : "text-ink-soft"
                        }`}
                      >
                        {scanned ? "Scanned" : "Not yet"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Change Password */}
            {showPasswordForm && (
              <div className="rounded-2xl border border-line bg-surface p-6">
                <h2 className="font-display text-xl text-ink mb-4">Change Password</h2>
                <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">
                      Current Password
                    </label>
                    <input
                      type="password"
                      {...register("currentPassword")}
                      className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface"
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-xs text-brick">{errors.currentPassword.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...register("newPassword")}
                      className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface"
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-xs text-brick">{errors.newPassword.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...register("confirmPassword")}
                      className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-brick">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-ink px-5 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmitting ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}