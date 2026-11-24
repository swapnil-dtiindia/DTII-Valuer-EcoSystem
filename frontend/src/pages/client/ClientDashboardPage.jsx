import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, FileSignature, FileWarning, FolderKanban, MapPin, Scale } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { portalApi } from '@/services/approvalsApi';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui/primitives';
import { PageHeader } from '@/components/data/PageHeader';
import { StatCard } from '@/components/data/StatCard';
import { EmptyState, ErrorState } from '@/components/data/States';
import { CaseStatusBadge } from '@/components/workflow/CaseStatusBadge';
import { formatDate } from '@/utils/format';

/** Client portal dashboard: own cases, requested documents, approvals and signed documents. */
export default function ClientDashboardPage() {
  const { me } = useAuth();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['portal', 'summary'], queryFn: portalApi.summary });
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  const v = (n) => (isLoading ? <Skeleton className="h-8 w-10" /> : n);
  return (
    <>
      <PageHeader title={`Welcome, ${me.user.fullName.split(' ')[0]}`} description={`Your valuation cases with ${me.context.firm.name}`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active cases" value={v(data?.counts.active)} icon={<FolderKanban />} href="/cases" />
        <StatCard label="Documents requested" value={v(data?.counts.pendingDocuments)} icon={<FileWarning />} />
        <StatCard label="In inspection" value={v(data?.counts.inspection)} icon={<MapPin />} />
        <StatCard label="In valuation" value={v(data?.counts.valuation)} icon={<Scale />} />
        <StatCard label="Signed reports" value={v(data?.counts.signedReports)} icon={<FileSignature />} href="/repository" hint="Ready to download" />
        <StatCard label="Completed" value={v(data?.counts.completed)} icon={<CheckCircle2 />} />
      </div>
      {data && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Documents requested from you</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.requests.length ? (
                data.requests.map((r) => (
                  <Link key={r.id} to={`/cases/${r.caseId}?tab=documents`} className="block rounded-lg border p-3 hover:border-primary/40">
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.description ? `${r.description} · ` : ''}requested {formatDate(r.createdAt)}
                      {r.dueDate ? ` · needed by ${formatDate(r.dueDate)}` : ''}
                    </p>
                  </Link>
                ))
              ) : (
                <EmptyState title="Nothing requested" description="You are all caught up." />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>My cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.cases.length ? (
                data.cases.map((c) => (
                  <Link key={c.id} to={`/cases/${c.id}${c.status === 'CASE_COMPLETED' ? '?tab=approval' : ''}`} className="flex flex-wrap items-center gap-2 rounded-lg border p-3 hover:border-primary/40">
                    <span className="font-mono text-xs font-semibold">{c.caseNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.category.name} · {c.bank.shortCode} · {c.financialYear.label}
                    </span>
                    <span className="ml-auto">
                      <CaseStatusBadge status={c.status} />
                    </span>
                  </Link>
                ))
              ) : (
                <EmptyState title="No cases yet" />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
