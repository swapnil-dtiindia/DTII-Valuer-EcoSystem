import { useQuery } from '@tanstack/react-query';
import { Building2, MailWarning, Plus, UserPlus, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { firmApi } from '@/services/adminApi';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui/primitives';
import { PageHeader } from '@/components/data/PageHeader';
import { StatCard } from '@/components/data/StatCard';
import { HorizontalBars } from '@/components/data/charts';
import { EmptyState, ErrorState } from '@/components/data/States';
import { formatDate, humanize } from '@/utils/format';

/** Firm Admin team overview: employees by role, pending invitations and recent clients (case analytics live on /dashboard). */
export default function AdminDashboardPage() {
  const { me } = useAuth();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['firm', 'summary'], queryFn: firmApi.summary });
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  const v = (n) => (isLoading ? <Skeleton className="h-8 w-14" /> : n);
  return (
    <>
      <PageHeader
        title="Team overview"
        description={`${me.context.firm.name} · ${me.context.firm.firmCode}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/employees/new">
                <UserPlus /> Add employee
              </Link>
            </Button>
            <Button asChild>
              <Link to="/clients/new">
                <Plus /> Add client
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active employees" value={v(data?.employees.active)} icon={<Users />} href="/employees?status=ACTIVE" />
        <StatCard label="Invites pending" value={v(data?.employees.pendingInvites)} icon={<MailWarning />} hint="Employees who have not set a password yet" href="/employees" />
        <StatCard label="Active clients" value={v(data?.clients.active)} icon={<Building2 />} href="/clients?status=ACTIVE" />
        <StatCard label="Clients with portal login" value={v(data?.clients.withPortalLogin)} icon={<Building2 />} href="/clients" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team by role</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <>
                <HorizontalBars
                  items={data.employeesByRole.map((r) => ({ key: r.code, label: r.name, value: r.count }))}
                  ariaLabel="Employees by role"
                  emptyText="No employees yet"
                  seriesName="People"
                />
                <ul className="mt-4 space-y-1 border-t pt-3">
                  {data.employeesByRole.map((r) => (
                    <li key={r.code}>
                      <Link to={`/employees?role=${r.code}`} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent">
                        <span>{r.name}</span>
                        <span className="tabular font-semibold">{r.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recently added clients</CardTitle>
            <Link to="/clients" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && <Skeleton className="m-5 h-24" />}
            {data?.recentClients.length === 0 && <EmptyState title="No clients yet" description="Register your first client to start creating cases." />}
            <ul className="divide-y">
              {data?.recentClients.map((c) => (
                <li key={c.id}>
                  <Link to={`/clients/${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/60">
                    <span className="font-mono text-xs text-muted-foreground">{c.clientCode}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.name}</span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">{humanize(c.clientType)}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
