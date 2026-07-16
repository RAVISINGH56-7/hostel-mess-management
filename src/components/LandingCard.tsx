"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef, type ReactNode } from "react";

type LandingCardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  accent: "saffron" | "curry" | "brick";
  index: number;
};

const ACCENT_MAP = {
  saffron: {
    border: "border-saffron/30",
    bg: "bg-saffron-soft/20",
    text: "text-saffron",
    btnBg: "bg-saffron",
    btnText: "text-[#101713]",
    glow: "hover:shadow-[0_0_40px_-8px_rgba(245,184,78,0.25)]",
    bar: "bg-saffron",
    hoverBorder: "group-hover:border-saffron/50",
  },
  curry: {
    border: "border-curry/30",
    bg: "bg-curry-soft/20",
    text: "text-curry",
    btnBg: "bg-curry",
    btnText: "text-[#101713]",
    glow: "hover:shadow-[0_0_40px_-8px_rgba(126,164,122,0.25)]",
    bar: "bg-curry",
    hoverBorder: "group-hover:border-curry/50",
  },
  brick: {
    border: "border-brick/30",
    bg: "bg-brick-soft/20",
    text: "text-brick",
    btnBg: "bg-brick",
    btnText: "text-[#101713]",
    glow: "hover:shadow-[0_0_40px_-8px_rgba(217,112,90,0.25)]",
    bar: "bg-brick",
    hoverBorder: "group-hover:border-brick/50",
  },
};

export default function LandingCard({
  href,
  icon,
  title,
  description,
  accent,
  index,
}: LandingCardProps) {
  const a = ACCENT_MAP[accent];
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      ref={linkRef}
      href={href}
      style={{ animationDelay: `${400 + index * 120}ms` }}
      className={`group relative flex flex-col rounded-2xl border ${a.border} ${a.glow} ${a.hoverBorder} bg-surface p-8 transition-all duration-500 ease-out hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink fade-up`}
    >
      {/* Top accent bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl ${a.bar} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* Icon */}
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-xl ${a.bg} ${a.text} mb-6 transition-transform duration-300 group-hover:scale-110`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <h3 className="font-display text-2xl tracking-tight text-ink">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {description}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Button */}
        <div className="mt-8">
          <span
            className={`inline-flex items-center gap-2 rounded-full ${a.btnBg} ${a.btnText} px-5 py-2.5 text-sm font-semibold transition-all duration-300 group-hover:gap-3`}
          >
            Enter Portal
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
