import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { casesApi } from '@/services/casesApi';
import { Badge, Card, Skeleton } from '@/components/ui/primitives';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/overlays';
import { PageHeader } from '@/components/data/PageHeader';
import { ErrorState } from '@/components/data/States';
import { CaseStatusBadge } from '@/components/workflow/CaseStatusBadge';
import { CASE_TABS } from './tabs';

/**
 * Case detail: header (Case ID, client, bank, FY, category, status) + role-filtered tabs.
 * Tabs only render what the API returns for this user; the API enforces every permission again.
 */
export default function CaseDetailPage() {
  const { id } = useParams();
  const { me, can } = useAuth();
  const [sp, setSp] = useSearchParams();
  const { data: c, isLoading, error, refetch } = useQuery({ queryKey: ['cases', 'detail', id], queryFn: () => casesApi.get(id) });

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading case">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="grid grid-cols-2 gap-px md:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <Skeleton className="h-10 w-full max-w-3xl" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const ctx = { c, me, can, isClient: !me.employee && !!me.client };
  const tabs = CASE_TABS.filter((t) => t.show(ctx));
  const active = tabs.some((t) => t.key === sp.get('tab')) ? sp.get('tab') : tabs[0].key;

  return (
    <>
      <PageHeader
        title={<span className="font-mono">{c.caseNumber}</span>}
        crumbs={[{ label: ctx.isClient ? 'My cases' : 'Cases', href: '/cases' }, { label: c.caseNumber }]}
        description={`${c.client.name} · ${c.bank.name}${c.bank.branch ? ` (${c.bank.branch})` : ''}`}
        actions={<CaseStatusBadge status={c.status} overdue={c.overdue} />}
      />
      <Card className="mb-6 grid grid-cols-2 gap-px overflow-hidden bg-border p-0 text-sm sm:grid-cols-3 md:grid-cols-5">
        {[
          ['Client', c.client.name],
          ['Bank / NBFC', c.bank.shortCode],
          ['Financial year', c.financialYear.label],
          ['Category', c.category.name],
          ['Priority', c.priority],
        ].map(([l, v]) => (
          <div key={l} className="bg-card px-4 py-3.5">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{l}</p>
            <p className="mt-1 truncate font-medium">{l === 'Priority' ? <Badge tone={v === 'NORMAL' ? 'neutral' : v === 'URGENT' ? 'danger' : 'warning'}>{v.toLowerCase()}</Badge> : v}</p>
          </div>
        ))}
      </Card>
      <Tabs value={active} onValueChange={(v) => setSp({ tab: v }, { replace: true })}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.key} value={t.key}>
            <t.Component {...ctx} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
