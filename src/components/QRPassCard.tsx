export default function QRPassCard() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="coupon-notch rounded-2xl border border-line bg-surface p-6 theme-sensitive-shadow transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
              Mess Pass
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Your pass will appear here after login
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center rounded-xl bg-surface-2 p-8">
          <div className="flex flex-col items-center gap-2 text-ink-soft/60">
            <div className="h-20 w-20 rounded-lg border-2 border-dashed border-ink-soft/20 flex items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft/40">
                QR
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Sign in to view
            </span>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-dashed border-line pt-4 font-mono text-xs">
          <div>
            <dt className="text-ink-soft">Room</dt>
            <dd className="mt-0.5 text-ink-soft/50">—</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Course</dt>
            <dd className="mt-0.5 text-ink-soft/50">—</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Pass ID</dt>
            <dd className="mt-0.5 text-ink-soft/50">—</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Today</dt>
            <dd className="mt-0.5 text-ink-soft/50">—</dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 text-center text-xs text-ink-soft">
        Every student gets one pass — show it at the counter for every meal.
      </p>
    </div>
  );
}
