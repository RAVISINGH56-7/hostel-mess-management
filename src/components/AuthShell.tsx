import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  aside: React.ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  aside,
}: AuthShellProps) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="BBIT logo"
              width={120}
              height={30}
              className="h-10 w-auto rounded-2xl bg-white/95 p-1.5 shadow-sm object-contain"
            />
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl tracking-tight text-ink">
                Tiffin
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft sm:inline">
                Hostel Mess Desk
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              <ArrowLeft size={15} />
              Back home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-12 px-6 py-12 lg:grid-cols-2 lg:items-center lg:gap-20 lg:py-20">
        <div className="order-2 lg:order-1">{aside}</div>

        <div className="order-1 mx-auto w-full max-w-md lg:order-2">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-curry">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {subtitle}
          </p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
