"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ShieldCheck, ScanLine } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LandingCard from "@/components/LandingCard";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-saffron/3 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full bg-curry/2 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-brick/2 blur-3xl" />
        <div
          className="absolute left-[15%] top-[20%] h-64 w-64 rounded-full bg-saffron/4 blur-3xl"
          style={{ animation: "float-1 18s ease-in-out infinite" }}
        />
        <div
          className="absolute right-[20%] top-[40%] h-48 w-48 rounded-full bg-curry/3 blur-3xl"
          style={{ animation: "float-2 22s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[25%] left-[30%] h-56 w-56 rounded-full bg-brick/3 blur-3xl"
          style={{ animation: "float-3 20s ease-in-out infinite" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-line/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:py-5">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Image
              src="https://www.bbit.edu.in/assets/frontend_template/img/logo.png"
              alt="BBIT"
              width={140}
              height={38}
              className="h-9 w-auto sm:h-10 bg-#eaefe9 rounded-sm p-0.5"
            />
          </Link>
          <div className="theme-toggle-rotate flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-20 pb-14 sm:pt-15 sm:pb-20">
        <div className="fade-up-hero mx-auto max-w-3xl text-center">
          {/* Tag chip */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron-soft/20 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-saffron">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron pulse-dot" />
            Hostel Mess Management
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl">
            One Platform for
            <br />
            <span className="gradient-text-saffron">Every Meal</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            QR-based meal tracking, real-time mess board updates, tray-side
            scanning, and full attendance analytics — all in one place.
          </p>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 sm:pb-28">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <LandingCard
            href="/login/student"
            icon={<GraduationCap size={28} strokeWidth={1.5} />}
            title="Student Portal"
            description="View your profile, today's meal status, and your personal QR pass. See your full attendance history at a glance."
            accent="curry"
            index={0}
          />
          <LandingCard
            href="/login/staff-admin"
            icon={<ShieldCheck size={28} strokeWidth={1.5} />}
            title="Admin & Warden"
            description="Register students, manage warden accounts, and track meal-wise consumption across the hostel in real time."
            accent="saffron"
            index={1}
          />
          <LandingCard
            href="/login/staff"
            icon={<ScanLine size={28} strokeWidth={1.5} />}
            title="Staff Scanner"
            description="Open the camera, scan a student's QR pass at the counter, and log breakfast, lunch, snacks, or dinner in one tap."
            accent="brick"
            index={2}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-line/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-xs text-ink-soft sm:flex-row sm:justify-between">
          <p className="font-mono uppercase tracking-[0.2em]">
            Tiffin · Hostel Mess Management
          </p>
          <p>
            Built as a final-year project · Roles: Admin, Warden, Staff, Student
          </p>
        </div>
      </footer>
    </div>
  );
}
