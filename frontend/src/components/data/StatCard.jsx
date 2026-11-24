import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/utils/cn';

const TONE = {
  primary: 'bg-primary-soft text-primary',
  danger: 'bg-destructive-soft text-destructive',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
};

const BAR = {
  primary: 'bg-primary',
  danger: 'bg-destructive',
  warning: 'bg-warning',
  success: 'bg-success',
  info: 'bg-info',
};

/** Counts up when `value` is a number. Skeleton nodes and formatted strings render as given. */
function useDisplayedValue(value) {
  const numeric = typeof value === 'number' && Number.isFinite(value);
  const fromRef = useRef(0);
  const [shown, setShown] = useState(() => {
    if (!numeric) return value;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return value;
    return 0;
  });

  useEffect(() => {
    if (!numeric) {
      setShown(value);
      return undefined;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    if (reduce || from === value) {
      fromRef.current = value;
      setShown(value);
      return undefined;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 650);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numeric, value]);

  if (numeric && typeof shown === 'number') return shown.toLocaleString('en-IN');
  return shown;
}

/**
 * Dashboard KPI tile. Becomes a link when `href` is given. `tone` only changes the icon well.
 * Linked tiles keep their existing destination; tiles without one stay informational.
 */
export function StatCard({ label, value, icon, hint, href, tone = 'primary', selected = false, onSelect }) {
  const display = useDisplayedValue(value);
  const toneClass = TONE[tone] ?? TONE.primary;
  const linked = Boolean(href) && !onSelect;
  const body = (
    <div
      className={cn(
        'relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] transition duration-200',
        linked || onSelect
          ? 'group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-[0_16px_36px_-20px_rgba(0,93,248,0.5)] group-active:translate-y-0 group-active:shadow-[var(--shadow-card)]'
          : 'group-hover:border-primary/25 group-hover:shadow-[0_12px_28px_-18px_rgba(12,18,34,0.35)]',
        selected && 'border-primary ring-2 ring-primary/30',
      )}
    >
      <span className={cn('absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100', selected && 'scale-x-100', BAR[tone] ?? BAR.primary)} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          <p className="tabular mt-2 text-[1.75rem] font-semibold leading-none tracking-tight">{display}</p>
        </div>
        {icon && (
          <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg transition duration-200 group-hover:scale-110 [&_svg]:size-5', toneClass)}>
            {icon}
          </div>
        )}
      </div>
      {(hint || href) && (
        <div className="flex items-end justify-between gap-3">
          {hint ? <p className="text-xs leading-snug text-muted-foreground">{hint}</p> : <span />}
          {href && onSelect && (
            <Link to={href} className="pointer-events-auto relative z-10 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary/80 transition hover:text-primary">
              Open
              <ArrowUpRight className="size-3.5 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </Link>
          )}
          {href && !onSelect && (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary/80 transition group-hover:text-primary">
              Open
              <ArrowUpRight className="size-3.5 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (onSelect) {
    return (
      <div className={cn('group relative h-full', selected && 'z-10')}>
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          aria-label={selected ? `${label}, selected. Click to clear.` : `${label}. Click to focus the dashboard.`}
          className="absolute inset-0 z-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <div className="pointer-events-none relative h-full">{body}</div>
      </div>
    );
  }

  if (!href) {
    return <div className="group h-full">{body}</div>;
  }

  return (
    <Link
      to={href}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {body}
    </Link>
  );
}
