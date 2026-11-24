import { cn } from '@/utils/cn';
import { Label } from '@/components/ui/primitives';

/** Label + control + error/hint. Pair the control with aria-invalid and aria-describedby={`${htmlFor}-error`}. */
export function Field({ label, htmlFor, error, hint, required, children, className }) {
  return (
    <div className={cn('group/field space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className={cn('transition-colors', error ? 'group-focus-within/field:text-destructive' : 'group-focus-within/field:text-primary')}>
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
