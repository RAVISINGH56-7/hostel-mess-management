"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Coffee,
  Soup,
  Cookie,
  Moon,
  StopCircle,
  Loader2,
  WifiOff,
  CameraOff,
  RefreshCw,
  ShieldAlert,
  Clock,
  ClockAlert,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

type MealKey = "breakfast" | "lunch" | "snacks" | "dinner";

const MEALS: { key: MealKey; label: string; icon: typeof Coffee }[] = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "lunch",     label: "Lunch",     icon: Soup   },
  { key: "snacks",    label: "Snacks",    icon: Cookie },
  { key: "dinner",    label: "Dinner",    icon: Moon   },
];

type ScanStatus = "success" | "duplicate" | "invalid" | "suspended" | "not_started" | "time_over" | "error";

type ScanResult = {
  id: number | string;
  name: string;
  room: string;
  meal: MealKey;
  time: string;
  status: ScanStatus;
  message?: string;
};

type CameraErrorType = "insecure" | "permission" | "notfound" | "inuse" | "generic" | null;

function normaliseError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return String(err);
}

function classifyError(err: unknown): CameraErrorType {
  const msg = normaliseError(err);
  if (msg.includes("NotAllowedError") || msg.includes("not allowed by the user agent") || msg.includes("Permission denied")) return "permission";
  if (msg.includes("NotFoundError") || msg.includes("Requested device not found")) return "notfound";
  if (msg.includes("NotReadableError") || msg.includes("Could not start video source")) return "inuse";
  if (msg.includes("SecurityError") || msg.includes("secure context")) return "insecure";
  if (msg.includes("OverconstrainedError") || msg.includes("environment")) return null;
  return "generic";
}

const CAMERA_ERRORS: Record<NonNullable<CameraErrorType>, { title: string; detail: string; showHttpsHint?: boolean }> = {
  insecure:   { title: "HTTPS required", detail: "Browsers block camera on plain HTTP. Restart dev server — HTTPS is on by default.", showHttpsHint: true },
  permission: { title: "Camera permission denied", detail: "Tap the lock icon in your address bar → set Camera to Allow → retry." },
  notfound:   { title: "No camera found", detail: "This device doesn't appear to have a camera." },
  inuse:      { title: "Camera in use", detail: "Another app or tab is using the camera. Close it and retry." },
  generic:    { title: "Unable to access camera", detail: "Check browser settings and make sure camera access is allowed for this site." },
};

const SCAN_UI: Record<ScanStatus, {
  banner: string;
  dot: string;
  label: string;
  Icon: React.ElementType;
  message: (r: ScanResult) => string;
}> = {
  success: {
    banner:  "border-green-500/30 bg-green-500/10 text-green-400",
    dot:     "text-green-400",
    label:   "Logged",
    Icon:    CheckCircle2,
    message: (r) => r.message || `${r.name} marked for ${r.meal}`,
  },
  duplicate: {
    banner:  "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    dot:     "text-yellow-400",
    label:   "Duplicate",
    Icon:    AlertTriangle,
    message: (r) => r.message || `${r.name} already scanned for ${r.meal}`,
  },
  invalid: {
    banner:  "border-orange-500/30 bg-orange-500/10 text-orange-400",
    dot:     "text-orange-400",
    label:   "Invalid",
    Icon:    AlertTriangle,
    message: (r) => r.message || "Invalid or expired QR code",
  },
  suspended: {
    banner:  "border-rose-500/30 bg-rose-500/10 text-rose-400",
    dot:     "text-rose-400",
    label:   "Suspended",
    Icon:    ShieldAlert,
    message: (r) => r.message || `${r.name}'s meal plan is suspended`,
  },
  not_started: {
    banner:  "border-blue-500/30 bg-blue-500/10 text-blue-400",
    dot:     "text-blue-400",
    label:   "Not Started",
    Icon:    Clock,
    message: (r) => r.message || `${r.meal} hasn't started yet`,
  },
  time_over: {
    banner:  "border-purple-500/30 bg-purple-500/10 text-purple-400",
    dot:     "text-purple-400",
    label:   "Time Over",
    Icon:    ClockAlert,
    message: (r) => r.message || `${r.meal} time is over`,
  },
  error: {
    banner:  "border-red-500/30 bg-red-500/10 text-red-400",
    dot:     "text-red-400",
    label:   "Error",
    Icon:    WifiOff,
    message: (r) => r.message || "Network error — check your connection",
  },
};

const VALID_STATUSES: ScanStatus[] = ["success", "duplicate", "invalid", "suspended", "not_started", "time_over"];

export default function ScannerPage() {
  const [meal, setMeal] = useState<MealKey>("lunch");
  const [log, setLog] = useState<ScanResult[]>([]);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [camLoading, setCamLoading] = useState(false);
  const [cameraError, setCameraError] = useState<CameraErrorType>(null);

  const scannerRef   = useRef<Html5Qrcode | null>(null);
  const isStartedRef = useRef(false);
  const startingRef  = useRef(false);
  const mealRef      = useRef<MealKey>(meal);
  useEffect(() => { mealRef.current = meal; }, [meal]);

  const cameraDivId = "qr-scanner-viewfinder";

  const safeStop = async (scanner: Html5Qrcode | null) => {
    if (!scanner || !isStartedRef.current) return;
    try { await scanner.stop(); } catch { /* ignore */ }
    finally { isStartedRef.current = false; }
  };

  const startCamera = async () => {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setCameraError("insecure");
      return;
    }
    await safeStop(scannerRef.current);
    scannerRef.current = null;
    setCameraError(null);
    setCamLoading(true);
    setScanning(true);
  };

  const stopCamera = async () => {
    await safeStop(scannerRef.current);
    setScanning(false);
    setCamLoading(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    await safeStop(scannerRef.current);
    setScanning(false);

    const currentMeal = mealRef.current;
    const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    try {
      const res = await fetch("/api/scanner/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: decodedText, meal: currentMeal }),
      });

      if (!res.ok) {
        let msg = `Server error (${res.status})`;
        try { const e = await res.json(); msg = e.error || msg; } catch { /* ignore */ }
        setLastResult({ id: Date.now(), name: "", room: "", meal: currentMeal, time, status: "error", message: msg });
        setTimeout(() => startCamera(), 2500);
        return;
      }

      const data = await res.json();
      const status: ScanStatus = VALID_STATUSES.includes(data.status) ? data.status : "error";

      const entry: ScanResult = {
        id:      Date.now(),
        name:    data.name    || "",
        room:    data.room    || "",
        meal:    currentMeal,
        time,
        status,
        message: data.message,
      };

      setLastResult(entry);
      if (entry.name) setLog((prev) => [entry, ...prev].slice(0, 8));

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reach server.";
      setLastResult({ id: Date.now(), name: "", room: "", meal: currentMeal, time, status: "error", message });
    }

    setTimeout(() => startCamera(), 2500);
  };

  useEffect(() => {
    let localScanner: Html5Qrcode | null = null;
    if (!scanning) return;
    if (startingRef.current) return;
    startingRef.current = true;

    const element = document.getElementById(cameraDivId);
    if (!element) {
      setScanning(false); setCamLoading(false); startingRef.current = false;
      return;
    }

    localScanner = new Html5Qrcode(cameraDivId, { verbose: false });
    scannerRef.current = localScanner;

    const config = {
      fps: 10,
      qrbox: (w: number, h: number) => {
        const size = Math.round(Math.min(w, h) * 0.65);
        return { width: size, height: size };
      },
    };

    const handleCameraError = (err: unknown) => {
      setCameraError(classifyError(err) ?? "generic");
      setCamLoading(false); setScanning(false);
      startingRef.current = false; isStartedRef.current = false;
    };

    const tryStart = (facingMode: "environment" | "user") =>
      localScanner!.start({ facingMode }, config, onScanSuccess, undefined).then(() => {
        isStartedRef.current = true;
        setCamLoading(false); setCameraError(null); startingRef.current = false;
      });

    tryStart("environment").catch((err) => {
      classifyError(err) === null
        ? tryStart("user").catch(handleCameraError)
        : handleCameraError(err);
    });

    return () => {
      if (localScanner && isStartedRef.current) {
        localScanner.stop().catch(() => {});
        isStartedRef.current = false;
      }
      startingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (cancelled) return;
      fetch("/api/scanner/scan/recent")
        .then((r) => r.json())
        .then((data) => { if (!cancelled) setLog(data); })
        .catch(() => {});
    };
    load();
    const iv = setInterval(load, 10_000);
    return () => {
      cancelled = true; clearInterval(iv);
      safeStop(scannerRef.current); scannerRef.current = null; setScanning(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lastResult) return;
    const t = setTimeout(() => setLastResult(null), 8000);
    return () => clearTimeout(t);
  }, [lastResult]);

  const camErr = cameraError ? CAMERA_ERRORS[cameraError] : null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-tight">Tiffin</span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft sm:inline">
              Staff Scanner
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-curry pulse-dot" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-curry" />
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Scanning for</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MEALS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setMeal(key)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  meal === key
                    ? "border-ink bg-ink text-surface"
                    : "border-line bg-surface text-ink-soft hover:text-ink"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
          {scanning && (
            <p className="mt-2 text-center font-mono text-[11px] text-ink-soft uppercase tracking-widest">
              Scanning for <span className="text-curry">{meal}</span> — tap above to switch
            </p>
          )}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-black">
          <div className="relative" style={{ minHeight: 320 }}>
            <div id={cameraDivId} className="w-full" />

            {!scanning && !camLoading && !camErr && (
              <button
                onClick={startCamera}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60 transition-colors hover:text-white/90"
              >
                <ScanLine size={44} strokeWidth={1.25} />
                <span className="font-mono text-xs uppercase tracking-[0.2em]">Tap to start camera</span>
              </button>
            )}

            {camLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-white/60">
                <Loader2 size={32} className="animate-spin" />
                <span className="font-mono text-xs uppercase tracking-[0.2em]">Starting camera…</span>
              </div>
            )}

            {camErr && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 p-6 text-center text-red-400">
                {cameraError === "insecure" ? <ShieldAlert size={40} strokeWidth={1.25} /> : <CameraOff size={40} strokeWidth={1.25} />}
                <div>
                  <p className="text-sm font-semibold">{camErr.title}</p>
                  <p className="mt-1 text-xs text-white/50 leading-relaxed max-w-xs">{camErr.detail}</p>
                </div>
                {camErr.showHttpsHint && (
                  <div className="mt-1 rounded-xl bg-white/10 px-4 py-3 text-left text-xs text-white/70 space-y-1 w-full max-w-xs">
                    <p className="font-semibold text-white/90">How to fix:</p>
                    <p>• Restart dev server — HTTPS is on by default</p>
                    <p>• Open <span className="font-mono">https://192.168.x.x:3000</span></p>
                    <p>• Accept the cert warning once</p>
                  </div>
                )}
                {cameraError !== "insecure" && (
                  <button onClick={startCamera} className="mt-2 flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/30">
                    <RefreshCw size={16} /> Retry
                  </button>
                )}
              </div>
            )}

            {scanning && !camErr && (
              <button
                onClick={stopCamera}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
              >
                <StopCircle size={20} />
              </button>
            )}
          </div>
        </div>

        {lastResult && (() => {
          const ui = SCAN_UI[lastResult.status];
          const { Icon } = ui;
          return (
            <div className={`mt-6 flap-in flex items-center gap-3 rounded-xl border px-4 py-3 ${ui.banner}`}>
              <Icon size={20} />
              <div className="text-sm">
                <p className="font-medium">{ui.message(lastResult)}</p>
                {lastResult.room && (
                  <p className="font-mono text-xs opacity-70">Room {lastResult.room} · {lastResult.time}</p>
                )}
              </div>
            </div>
          );
        })()}

        <div className="mt-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Recent scans</p>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
            {log.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-ink-soft">No scans yet today.</li>
            ) : (
              log.map((entry) => {
                const ui = SCAN_UI[entry.status];
                return (
                  <li key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2/50">
                    <div>
                      <p className="text-sm font-medium text-ink">{entry.name}</p>
                      <p className="font-mono text-xs text-ink-soft">Room {entry.room} · {entry.meal}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-ink-soft">{entry.time}</p>
                      <p className={`mt-0.5 font-mono text-xs uppercase tracking-[0.1em] ${ui.dot}`}>{ui.label}</p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
