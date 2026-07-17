"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import FormField from "@/components/FormField";
import { studentFormSchema, StudentFormData } from "@/lib/validations/student";
import { toast } from "sonner";
import { Copy, CheckCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function NewStudentPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [diet, setDiet] = useState("");
  const [credentials, setCredentials] = useState<{ username: string; password: string; passId: string; qrSecret: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
  });

  const onSubmit = async (data: StudentFormData) => {
    setLoading(true);
    setServerError("");
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (diet) {
        formData.append("diet", diet);
      }
      if (photo) {
        formData.append("photo", photo);
      }

      const res = await fetch("/api/warden/students", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Registration failed";
        try {
          const err = await res.json();
          if (typeof err.error === "string") {
            message = err.error;
          } else if (err.error?.message) {
            message = err.error.message;
          } else if (err.error?.issues?.[0]?.message) {
            message = err.error.issues[0].message;
          }
        } catch {
          const text = await res.text();
          if (text) message = text;
        }
        setServerError(message);
        setLoading(false);
        return;
      }

      const result = await res.json();
      // Show credentials modal with QR code
      setCredentials({ username: result.username, password: result.password || "student123", passId: result.passId, qrSecret: result.qrSecret });
      setLoading(false);
    } catch (e) {
      setServerError("Network error");
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyCredentials = async () => {
    if (!credentials) return;
    const text = `Username: ${credentials.username}\nPassword: ${credentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Credentials copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl text-ink">Register Student</h1>
        <p className="mt-2 text-ink-soft">Add a new student to your block.</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6 rounded-2xl border border-line bg-surface p-6"
        >
          <FormField
            label="Full Name"
            {...register("name")}
            error={errors.name?.message}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <FormField
              label="Phone"
              {...register("phone")}
              error={errors.phone?.message}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Room"
              {...register("room")}
              error={errors.room?.message}
            />
            <FormField
              label="Roll Number"
              {...register("rollNumber")}
              error={errors.rollNumber?.message}
              placeholder="e.g. 2026BTCS1001"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Course"
              {...register("course")}
              error={errors.course?.message}
            />
            <FormField
              label="Semester"
              type="number"
              min={1}
              max={8}
              {...register("semester", { valueAsNumber: true })}
              error={errors.semester?.message}
            />
          </div>
          
          <div className="rounded-xl bg-surface-2 p-4 text-sm text-ink-soft">
            <p className="font-medium text-ink">How login works</p>
            <p className="mt-1 leading-relaxed">
              Username is set to the roll number. Password is the last 4 digits of the roll number followed by <code className="rounded bg-ink px-1.5 py-0.5 text-xs text-surface">_pass</code>.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">
              Diet
            </label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface"
            >
              <option value="">Select...</option>
              <option value="VEG">Vegetarian</option>
              <option value="NON_VEG">Non-Vegetarian</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">
              Photo
            </label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-surface file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-1 file:text-xs file:text-ink-soft"
            />
            {photoPreview && (
              <Image
                src={photoPreview}
                alt="Preview"
                width={128}
                height={128}
                unoptimized
                className="mt-4 h-32 w-32 rounded-xl object-cover"
              />
            )}
          </div>

          {serverError && <p className="text-sm text-brick">{serverError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-ink px-5 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register Student"}
          </button>
        </form>

        {/* Credentials Modal */}
        {credentials && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="mx-4 w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
              <h2 className="font-display text-2xl text-ink">Student Registered</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Share these credentials with the student.
              </p>
              {/* QR Code */}
              <div className="mt-5 flex items-center justify-center rounded-xl bg-white p-4">
                <QRCodeSVG value={credentials.qrSecret} size={160} bgColor="transparent" fgColor="#1a1a2e" level="Q" />
              </div>
              {credentials.passId && (
                <p className="mt-2 text-center font-mono text-[11px] text-ink-soft">Pass ID: {credentials.passId}</p>
              )}
              <div className="mt-4 space-y-3 rounded-xl bg-ink p-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-surface/50">Username</p>
                  <p className="font-mono text-lg text-surface">{credentials.username}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-surface/50">Password</p>
                  <p className="font-mono text-lg text-surface">{credentials.password}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={copyCredentials}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90"
                >
                  {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy Credentials"}
                </button>
                <button
                  onClick={() => {
                    setCredentials(null);
                    setCopied(false);
                    router.push("/dashboard/warden/students");
                    router.refresh();
                  }}
                  className="flex-1 rounded-xl border border-line px-5 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
