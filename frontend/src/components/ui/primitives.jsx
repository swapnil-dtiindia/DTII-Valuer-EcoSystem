import { Slot } from '@radix-ui/react-slot';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

/* ───────────── Button ───────────── */

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md active:shadow-sm',
        outline: 'border border-input bg-card text-foreground hover:border-primary/30 hover:bg-accent hover:shadow-sm',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-muted hover:shadow-sm',
        ghost: 'text-foreground hover:bg-accent',
        destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-md active:shadow-sm',
        link: 'px-0 text-primary underline-offset-4 shadow-none hover:underline active:scale-100',
      },
      size: { default: 'h-9 px-4', sm: 'h-8 px-3 text-xs', lg: 'h-11 px-6', icon: 'h-9 w-9' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

/**
 * @param {{ variant?: 'default'|'outline'|'secondary'|'ghost'|'destructive'|'link', size?: 'default'|'sm'|'lg'|'icon',
 *           asChild?: boolean, loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export const Button = forwardRef(function Button({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Comp>
  );
});

/* ───────────── Inputs ───────────── */

const fieldBase =
  'flex w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted-foreground/70 hover:border-primary/35 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/15';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldBase, 'h-9 py-1', className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(fieldBase, 'min-h-20 py-2', className)} {...props} />;
});

/** Native select: fully accessible and keyboard-friendly, styled to match. */
export const NativeSelect = forwardRef(function NativeSelect({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        fieldBase,
        'h-9 py-1 pr-8 appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%235b667a%27 stroke-width=%272%27 viewBox=%270 0 24 24%27><path d=%27m6 9 6 6 6-6%27/></svg>")] bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export const Label = forwardRef(function Label({ className, ...props }, ref) {
  return <LabelPrimitive.Root ref={ref} className={cn('text-sm font-medium text-foreground', className)} {...props} />;
});

/* ───────────── Card ───────────── */

export function Card({ className, ...props }) {
  return <div className={cn('rounded-xl border bg-card text-card-foreground shadow-[var(--shadow-card)]', className)} {...props} />;
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-3', className)} {...props} />;
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-base font-semibold tracking-tight', className)} {...props} />;
}
export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
export function CardContent({ className, ...props }) {
  return <div className={cn('p-5 pt-2', className)} {...props} />;
}

/* ───────────── Badge ───────────── */

export const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', {
  variants: {
    tone: {
      neutral: 'bg-muted text-secondary-foreground ring-border',
      primary: 'bg-primary-soft text-primary ring-primary/20',
      info: 'bg-info-soft text-info ring-info/20',
      success: 'bg-success-soft text-success ring-success/25',
      warning: 'bg-warning-soft text-warning ring-warning/25',
      danger: 'bg-destructive-soft text-destructive ring-destructive/25',
      teal: 'bg-teal-soft text-teal ring-teal/25',
      violet: 'bg-violet-soft text-violet ring-violet/25',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

/** @param {{ tone?: 'neutral'|'primary'|'info'|'success'|'warning'|'danger'|'teal'|'violet', dot?: boolean } & React.HTMLAttributes<HTMLSpanElement>} props */
export function Badge({ className, tone, dot, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

/* ───────────── Misc ───────────── */

/** Shimmer placeholder. Replaces the old pulse block everywhere a page or table is loading. */
export function Skeleton({ className, ...props }) {
  return <div className={cn('skeleton rounded-md', className)} aria-hidden {...props} />;
}

/** Compact placeholder for sign-in and other public cards. */
export function FormSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite" aria-label="Loading">
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

/** Page-shaped placeholder used while a screen or its data is loading. */
export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function Separator({ className }) {
  return <div role="separator" className={cn('h-px w-full bg-border', className)} />;
}

export function Spinner({ className }) {
  return <Loader2 className={cn('size-5 animate-spin text-primary', className)} aria-label="Loading" />;
}
