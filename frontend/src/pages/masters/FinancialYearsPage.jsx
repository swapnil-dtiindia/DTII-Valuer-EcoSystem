import { useQuery } from '@tanstack/react-query';
import { mastersApi } from '@/services/casesApi';
import { Badge, Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/data/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { formatDate } from '@/utils/format';

export default function FinancialYearsPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['masters', 'fy'], queryFn: mastersApi.financialYears });
  const columns = [
    { key: 'label', header: 'Financial year', cell: (f) => <span className="font-medium">{f.label}</span> },
    { key: 'code', header: 'Case ID code', cell: (f) => <span className="font-mono text-xs">FY{f.shortCode}</span> },
    { key: 'from', header: 'From', cell: (f) => formatDate(f.startDate) },
    { key: 'to', header: 'To', cell: (f) => formatDate(f.endDate) },
    { key: 'status', header: 'Status', cell: (f) => (f.isCurrent ? <Badge dot tone="primary">Current</Badge> : <Badge dot tone={f.status === 'OPEN' ? 'success' : 'neutral'}>{f.status.toLowerCase()}</Badge>) },
  ];
  return (
    <>
      <PageHeader title="Financial years" description="Indian financial years (April–March). Each Case ID includes its financial year; numbering restarts every year." />
      <Card>
        <DataTable columns={columns} rows={data?.items} loading={isLoading} error={error} onRetry={refetch} />
      </Card>
    </>
  );
}
