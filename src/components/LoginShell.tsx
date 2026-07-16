"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { type ReactNode } from "react";
import ThemeToggle from "./ThemeToggle";

type Accent = "curry" | "saffron" | "brick";

type LoginShellProps = {
  accent: Accent;
  icon: ReactNode;
  portalTitle: string;
  portalSubtitle: string;
  formTitle: string;
  formSubtitle: string;
  children: ReactNode;
};

const ACCENT_COLORS: Record<
  Accent,
  {
    accentBg: string;
    accentText: string;
    accentBorder: string;
    btnBg: string;
    btnHover: string;
    chipBg: string;
  }
> = {
  curry: {
    accentBg: "bg-curry",
    accentText: "text-curry",
    accentBorder: "border-curry/30",
    btnBg: "bg-curry",
    btnHover: "hover:bg-curry/90",
    chipBg: "bg-curry-soft",
  },
  saffron: {
    accentBg: "bg-saffron",
    accentText: "text-saffron",
    accentBorder: "border-saffron/30",
    btnBg: "bg-saffron",
    btnHover: "hover:bg-saffron/90",
    chipBg: "bg-saffron-soft",
  },
  brick: {
    accentBg: "bg-brick",
    accentText: "text-brick",
    accentBorder: "border-brick/30",
    btnBg: "bg-brick",
    btnHover: "hover:bg-brick/90",
    chipBg: "bg-brick-soft",
  },
};

export default function LoginShell({
  accent,
  icon,
  portalTitle,
  portalSubtitle,
  formTitle,
  formSubtitle,
  children,
}: LoginShellProps) {
  const c = ACCENT_COLORS[accent];

  return (
    <div className="relative flex min-h-full flex-col">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className={`pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full ${c.accentBg}/5 blur-3xl`} />
        <div className={`pointer-events-none absolute -bottom-40 -right-40 h-[24rem] w-[24rem] rounded-full ${c.accentBg}/4 blur-3xl`} />
      </div>

      {/* Header */}
      <header className="border-b border-line/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Image
              src="https://www.bbit.edu.in/assets/frontend_template/img/logo.png"
              alt="BBIT"
              width={130}
              height={36}
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              <ArrowLeft size={15} />
              Back
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 lg:flex-row lg:items-center lg:gap-16 lg:py-16">
        {/* Portal info (left) */}
        <div className="mb-10 lg:mb-0 lg:w-1/2">
          <div
            className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${c.chipBg} ${c.accentText} mb-6 ring-1 ring-inset ring-current/20`}
          >
            {icon}
          </div>
          <h1 className="font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            {portalTitle}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            {portalSubtitle}
          </p>

          {/* Decorative divider */}
          <div className="mt-10 flex items-center gap-3 pr-12">
            <div className={`h-px flex-1 ${c.accentBorder}`} />
            <div className={`h-2 w-2 rounded-full ${c.accentBg} opacity-60`} />
            <div className={`h-px flex-1 ${c.accentBorder}`} />
          </div>
        </div>

        {/* Form panel (right) */}
        <div className="w-full lg:w-1/2 lg:max-w-md">
          <div className="rounded-2xl border border-line bg-surface p-8 shadow-lg transition-colors">
            <div className="mb-6">
              <h2 className="font-display text-2xl tracking-tight text-ink">
                {formTitle}
              </h2>
              <p className="mt-1.5 text-sm text-ink-soft">{formSubtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
