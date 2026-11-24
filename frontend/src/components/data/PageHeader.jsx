import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

/** Page title with optional breadcrumbs (`crumbs: { label, href? }[]`) and right-aligned actions. */
export function PageHeader({ title, description, crumbs, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {crumbs?.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3" aria-hidden />}
                {c.href ? (
                  <Link to={c.href} className="rounded px-1 py-0.5 transition hover:bg-accent hover:text-foreground">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-foreground/80">
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="truncate text-[1.65rem] font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
