import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, buttonVariants } from './primitives';

/* ───────────── Dialog ───────────── */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

/** Centered modal, or a right-hand side sheet when `side` is true. `title` is required for accessibility. */
export function DialogContent({ className, children, title, description, side, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0a1633]/40 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 bg-card shadow-2xl focus:outline-none',
          side
            ? 'inset-y-0 right-0 h-full w-full max-w-xl border-l overflow-y-auto'
            : 'left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border max-h-[90vh] overflow-y-auto',
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div>
            <DialogPrimitive.Title className="text-base font-semibold">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className={description ? 'mt-0.5 text-sm text-muted-foreground' : 'sr-only'}>
              {description || title}
            </DialogPrimitive.Description>
          </div>
          <DialogPrimitive.Close className="rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Close">
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        <div className="px-6 py-5">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/* ───────────── Confirm dialog ───────────── */

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', destructive, loading, onConfirm, children }) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0a1633]/40 backdrop-blur-[2px]" />
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-2xl">
          <AlertDialogPrimitive.Title className="text-base font-semibold">{title}</AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">{description}</AlertDialogPrimitive.Description>
          {children}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialogPrimitive.Cancel className={buttonVariants({ variant: 'outline' })}>Cancel</AlertDialogPrimitive.Cancel>
            <Button variant={destructive ? 'destructive' : 'default'} loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

/* ───────────── Dropdown ───────────── */

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({ className, align = 'end', ...props }) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content align={align} sideOffset={6} className={cn('z-50 min-w-48 rounded-lg border bg-card p-1 shadow-xl', className)} {...props} />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }) {
  return <DropdownPrimitive.Label className={cn('px-2.5 py-2 text-xs text-muted-foreground', className)} {...props} />;
}

export function DropdownMenuSeparator() {
  return <DropdownPrimitive.Separator className="my-1 h-px bg-border" />;
}

/* ───────────── Tabs ───────────── */

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }) {
  return <TabsPrimitive.List className={cn('inline-flex items-center gap-1 rounded-lg bg-muted p-1', className)} {...props} />;
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn('mt-4 focus-visible:outline-none', className)} {...props} />;
}
