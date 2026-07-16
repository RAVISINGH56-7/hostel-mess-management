import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type PortalCardProps = {
  href: string;
  code: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "saffron" | "curry" | "brick";
};

const ACCENT_MAP = {
  saffron: {
    chip: "bg-saffron-soft text-saffron",
    ring: "group-hover:border-saffron/40",
  },
  curry: {
    chip: "bg-curry-soft text-curry",
    ring: "group-hover:border-curry/40",
  },
  brick: {
    chip: "bg-brick-soft text-brick",
    ring: "group-hover:border-brick/40",
  },
};

export default function PortalCard({
  href,
  code,
  icon: Icon,
  title,
  description,
  accent,
}: PortalCardProps) {
  const accentClasses = ACCENT_MAP[accent];

  return (
    <Link
      href={href}
      className={`coupon-notch group relative flex flex-col justify-between gap-6 rounded-2xl border border-line bg-surface p-6 transition-colors duration-300 ${accentClasses.ring} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${accentClasses.chip}`}
        >
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          {code}
        </span>
      </div>

      <div>
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-line pt-4 font-mono text-xs uppercase tracking-[0.15em] text-ink">
        <span>Enter portal</span>
        <ArrowUpRight
          size={16}
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Link>
  );
}