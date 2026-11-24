import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, FilePlus2, FileSearch, FileSignature, FolderKanban, IndianRupee, MapPin, Plus, Scale, Send, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { analyticsApi } from '@/services/analyticsApi';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@/components/ui/primitives';
import { PageHeader } from '@/components/data/PageHeader';
import { StatCard } from '@/components/data/StatCard';
import { DonutBreakdown, HorizontalBars, StackedColumns, TrendArea } from '@/components/data/charts';
import { ErrorState } from '@/components/data/States';
import { CaseStatusBadge } from '@/components/workflow/CaseStatusBadge';
import { CASE_STATUS, STAGE_LABEL } from '@/utils/caseStatus';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

/** Statuses behind each KPI. Tiles omitted here focus the card without narrowing the charts. */
const TILE_STATUSES = {
  newCases: ['CASE_RECEIVED'],
  pendingInspection: ['INSPECTION_ASSIGNED', 'INSPECTION_IN_PROGRESS'],
  inspectionCompleted: ['INSPECTION_COMPLETED'],
  preliminaryPending: ['INSPECTION_COMPLETED', 'PRELIMINARY_VALUATION_IN_PROGRESS', 'SENT_BACK_FOR_CORRECTION'],
  seniorPending: ['PRELIMINARY_SUBMITTED', 'FINAL_REVIEW_IN_PROGRESS'],
  awaitingSignature: ['FINAL_APPROVED'],
  awaitingPayment: ['PAYMENT_PENDING'],
  completed: ['CASE_COMPLETED'],
  pendingAssignment: ['CASE_RECEIVED'],
  inValuation: ['INSPECTION_ASSIGNED', 'INSPECTION_IN_PROGRESS', 'INSPECTION_COMPLETED', 'PRELIMINARY_VALUATION_IN_PROGRESS', 'SENT_BACK_FOR_CORRECTION', 'PRELIMINARY_SUBMITTED', 'FINAL_REVIEW_IN_PROGRESS', 'FINAL_APPROVED'],
  pendingReviews: ['INSPECTION_COMPLETED'],
  inProgress: ['PRELIMINARY_VALUATION_IN_PROGRESS'],
  returned: ['SENT_BACK_FOR_CORRECTION'],
  submitted: ['PRELIMINARY_SUBMITTED', 'FINAL_REVIEW_IN_PROGRESS'],
  pendingApprovals: ['PRELIMINARY_SUBMITTED'],
  underReview: ['FINAL_REVIEW_IN_PROGRESS'],
};

const toggleFocus = (current, next) => (current && current.kind === next.kind && current.key === next.key ? null : next);

function statusesFor(focus) {
  if (!focus) return null;
  if (focus.kind === 'status') return [focus.key];
  if (focus.kind === 'tile') return TILE_STATUSES[focus.key] ?? null;
  return null;
}

const TILE_SETS = {
  FIRM_ADMIN: [
    ['total', 'Total cases', FolderKanban, '/cases'],
    ['newCases', 'New cases', FilePlus2, '/cases?statusGroup=NEW'],
    ['pendingInspection', 'Pending inspection', MapPin, '/cases?statusGroup=INSPECTION'],
    ['inspectionCompleted', 'Inspection completed', ClipboardCheck, '/cases?statusGroup=PRELIMINARY'],
    ['preliminaryPending', 'Preliminary review pending', FileSearch, '/cases?statusGroup=PRELIMINARY'],
    ['seniorPending', 'Senior review pending', Scale, '/cases?statusGroup=SENIOR_REVIEW'],
    ['awaitingSignature', 'Awaiting valuer signature', FileSignature, '/cases?statusGroup=AWAITING_SIGNATURE'],
    ['awaitingPayment', 'Signed – payment pending', IndianRupee, '/cases?statusGroup=AWAITING_PAYMENT'],
    ['completed', 'Completed (report signed)', CheckCircle2, '/cases?statusGroup=CLOSED'],
    ['overdue', 'Overdue', AlertTriangle, '/cases?overdue=true'],
  ],
  MARKETING: [
    ['received', 'Cases received', FolderKanban, '/cases'],
    ['pendingAssignment', 'Pending field assignment', MapPin, '/cases?statusGroup=NEW'],
    ['awaitingDocuments', 'Awaiting client documents', FileSearch, '/cases'],
    ['inValuation', 'In valuation', Scale, '/cases?statusGroup=ACTIVE'],
    ['awaitingPayment', 'Signed – payment pending', IndianRupee, '/cases?statusGroup=AWAITING_PAYMENT'],
    ['completed', 'Completed (report signed)', CheckCircle2, '/cases?statusGroup=CLOSED'],
  ],
  JUNIOR_REVIEWER: [
    ['pendingReviews', 'Pending reviews', FileSearch, '/cases?assignedToMe=true&statusGroup=PRELIMINARY'],
    ['inProgress', 'In-progress valuations', Scale, '/cases?assignedToMe=true&statusGroup=PRELIMINARY'],
    ['returned', 'Returned for correction', AlertTriangle, '/cases?assignedToMe=true&statusGroup=PRELIMINARY'],
    ['submitted', 'Submitted reports', Send, '/cases?assignedToMe=true&statusGroup=SENIOR_REVIEW'],
  ],
  SENIOR_REVIEWER: [
    ['pendingApprovals', 'Pending approvals', FileSearch, '/cases?assignedToMe=true&statusGroup=SENIOR_REVIEW'],
    ['underReview', 'Reports under review', Scale, '/cases?assignedToMe=true&statusGroup=SENIOR_REVIEW'],
    ['returned', 'Returned reports', AlertTriangle, '/cases?assignedToMe=true&statusGroup=PRELIMINARY'],
    ['awaitingSignature', 'Awaiting your signature', FileSignature, '/cases?assignedToMe=true&statusGroup=AWAITING_SIGNATURE'],
    ['approved', 'Approved reports', CheckCircle2, '/cases?assignedToMe=true'],
  ],
};

const LOAD_SERIES = [
  { key: 'Marketing', label: 'Marketing', color: '#005df8' },
  { key: 'Field', label: 'Field officer', color: '#0e7490' },
  { key: 'Junior', label: 'Junior reviewer', color: '#138a52' },
  { key: 'Senior', label: 'Senior reviewer', color: '#6366f1' },
];

function statusItems(byStatus) {
  return Object.entries(byStatus)
    .sort((a, b) => b[1] - a[1])
    .map(([s, n]) => ({ key: s, name: CASE_STATUS[s]?.label ?? s, value: n }));
}

function AdminAnalytics({ d, focus, setFocus }) {
  const months = d.monthlyIntake.map((m) => ({
    label: new Date(`${m.month}-01`).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    value: m.cases,
  }));
  const peak = months.reduce((best, m) => (m.value > (best?.value ?? 0) ? m : best), null);
  const busiest = d.workload[0];
  const load = d.workload.slice(0, 8).map((e) => ({
    id: e.id,
    label: e.name.split(' ')[0],
    Marketing: e.stages.MARKETING ?? 0,
    Field: e.stages.FIELD ?? 0,
    Junior: e.stages.JUNIOR ?? 0,
    Senior: e.stages.SENIOR ?? 0,
  }));
  const turnaround = d.turnaround
    .filter((t) => CASE_STATUS[t.status])
    .sort((a, b) => b.hours - a.hours)
    .map((t) => ({ key: t.status, label: CASE_STATUS[t.status].label, value: t.hours }));
  const active = statusesFor(focus);
  const recent = active ? d.recent.filter((c) => active.includes(c.status)) : d.recent;
  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-5">
      {(peak?.value > 0 || busiest) && (
        <div className="flex flex-wrap gap-2 xl:col-span-5">
          {peak?.value > 0 && (
            <button type="button" onClick={() => document.getElementById('dash-intake')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="rounded-full border bg-card px-3 py-1.5 text-sm shadow-[var(--shadow-card)] transition hover:border-primary/40 hover:text-primary">
              Busiest month · {peak.label} · {peak.value.toLocaleString('en-IN')} cases
            </button>
          )}
          {busiest && (
            <button
              type="button"
              onClick={() => {
                setFocus((cur) => toggleFocus(cur, { kind: 'person', key: busiest.id }));
                document.getElementById('dash-load')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={cn('rounded-full border bg-card px-3 py-1.5 text-sm shadow-[var(--shadow-card)] transition hover:border-primary/40 hover:text-primary', focus?.kind === 'person' && focus.key === busiest.id && 'border-primary bg-primary-soft text-primary')}
            >
              Busiest person · {busiest.name} · {busiest.total} open
            </button>
          )}
        </div>
      )}
      <Card id="dash-intake" className="xl:col-span-3">
        <CardHeader>
          <CardTitle>New cases per month</CardTitle>
          <CardDescription>Intake over the last six months.</CardDescription>
        </CardHeader>
        <CardContent>
          <TrendArea items={months} ariaLabel="New cases per month" emptyText="No cases opened in the last six months" />
        </CardContent>
      </Card>
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Cases by status</CardTitle>
          <CardDescription>Click a stage to focus the chart and the latest cases.</CardDescription>
        </CardHeader>
        <CardContent>
          <DonutBreakdown items={statusItems(d.byStatus)} ariaLabel="Cases by status" activeKeys={active} onSelect={(key) => setFocus((cur) => toggleFocus(cur, { kind: 'status', key }))} />
        </CardContent>
      </Card>
      <Card id="dash-load" className="xl:col-span-3">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Employee workload</CardTitle>
            <CardDescription>Click a person to isolate their bar. The name opens their profile.</CardDescription>
          </div>
          <Link to="/team" className="text-sm font-medium text-primary hover:underline">
            Team overview
          </Link>
        </CardHeader>
        <CardContent>
          <StackedColumns items={load} series={LOAD_SERIES} ariaLabel="Open assignments by employee and stage" activeId={focus?.kind === 'person' ? focus.key : undefined} onSelect={(id) => id && setFocus((cur) => toggleFocus(cur, { kind: 'person', key: id }))} />
        </CardContent>
        <div className="overflow-x-auto border-t">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2 font-medium">Employee</th>
                {['MARKETING', 'FIELD', 'JUNIOR', 'SENIOR'].map((s) => (
                  <th key={s} className="px-2 py-2 text-right font-medium">
                    {STAGE_LABEL[s]}
                  </th>
                ))}
                <th className="px-5 py-2 text-right font-medium">Open</th>
              </tr>
            </thead>
            <tbody>
              {d.workload.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">
                    No open assignments
                  </td>
                </tr>
              )}
              {d.workload.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setFocus((cur) => toggleFocus(cur, { kind: 'person', key: e.id }))}
                  className={cn('cursor-pointer border-b transition last:border-0', focus?.kind === 'person' && focus.key === e.id ? 'bg-primary-soft/80' : 'hover:bg-accent/60')}
                >
                  <td className="px-5 py-2">
                    <Link to={`/employees/${e.id}`} onClick={(ev) => ev.stopPropagation()} className="font-medium hover:text-primary">
                      {e.name}
                    </Link>{' '}
                    <span className="font-mono text-[10px] text-muted-foreground">{e.employeeCode}</span>
                  </td>
                  {['MARKETING', 'FIELD', 'JUNIOR', 'SENIOR'].map((s) => (
                    <td key={s} className="tabular px-2 py-2 text-right">
                      {e.stages[s] ?? '–'}
                    </td>
                  ))}
                  <td className="tabular px-5 py-2 text-right font-semibold">{e.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Average time in each stage</CardTitle>
          <CardDescription>Hours, last 180 days, from the status history.</CardDescription>
        </CardHeader>
        <CardContent>
          <HorizontalBars items={turnaround} format={(h) => `${h.toLocaleString('en-IN')} h`} seriesName="Hours" emptyText="Not enough completed stages yet" ariaLabel="Average hours per stage" color="#0e7490" />
        </CardContent>
      </Card>
      <Card className="xl:col-span-5">
        <CardHeader>
          <CardTitle>Recent cases</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {recent.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">None of the latest cases are in this selection.</li>}
            {recent.map((c) => (
              <li key={c.id}>
                <Link to={`/cases/${c.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-accent/60">
                  <span className="font-mono text-xs font-semibold">{c.caseNumber}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{c.client.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.bank.shortCode} · {formatDate(c.createdAt)}
                  </span>
                  <CaseStatusBadge status={c.status} />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/** Role-specific dashboard (Firm Admin, Marketing, Junior / Senior reviewer). Field officers use My inspections. */
export default function DashboardPage() {
  const { me, can } = useAuth();
  const [focus, setFocus] = useState(null);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: analyticsApi.dashboard, refetchInterval: 120_000 });
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  const tiles = TILE_SETS[data?.role] ?? [];
  const active = statusesFor(focus);
  const focusName = focus?.kind === 'tile' ? tiles.find((t) => t[0] === focus.key)?.[1] : focus?.kind === 'status' ? (CASE_STATUS[focus.key]?.label ?? focus.key) : focus?.kind === 'person' ? data?.workload?.find((e) => e.id === focus.key)?.name : null;
  return (
    <>
      <PageHeader
        title={`Welcome, ${me.user.fullName.split(' ')[0]}`}
        description={`${me.context.firm.name} · ${me.context.roles.map((r) => r.name).join(', ')}`}
        actions={
          can('case.create') && (
            <Button asChild>
              <Link to="/cases/new">
                <Plus /> New case
              </Link>
            </Button>
          )
        }
      />
      {isLoading ? (
        <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-5">
            <Skeleton className="h-72 xl:col-span-3" />
            <Skeleton className="h-72 xl:col-span-2" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {tiles.map(([key, label, Icon, href]) => (
              <StatCard
                key={key}
                label={label}
                value={data.tiles[key] ?? 0}
                icon={<Icon />}
                href={href}
                selected={focus?.kind === 'tile' && focus.key === key}
                onSelect={() => setFocus((cur) => toggleFocus(cur, { kind: 'tile', key }))}
                tone={key === 'overdue' && (data.tiles[key] ?? 0) > 0 ? 'danger' : 'primary'}
              />
            ))}
          </div>
          {focusName && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <p className="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">Showing {focusName}</p>
              <button type="button" onClick={() => setFocus(null)} className="rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
                Show everything
              </button>
            </div>
          )}
          {data.role === 'FIRM_ADMIN' ? (
            <AdminAnalytics d={data} focus={focus} setFocus={setFocus} />
          ) : (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>My cases by status</CardTitle>
                <CardDescription>Click a stage to focus it. Open on a card still goes to the case list.</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutBreakdown items={statusItems(data.byStatus)} emptyText="No cases assigned to you yet" ariaLabel="My cases by status" activeKeys={active} onSelect={(key) => setFocus((cur) => toggleFocus(cur, { kind: 'status', key }))} />
              </CardContent>
            </Card>
          )}
          {data.role === 'FIRM_ADMIN' && (
            <p className="mt-4 text-xs text-muted-foreground">
              <Users className="mr-1 inline size-3.5" /> Team, invitations and clients: see <Link to="/team" className="text-primary hover:underline">Team overview</Link>.
            </p>
          )}
        </>
      )}
    </>
  );
}
