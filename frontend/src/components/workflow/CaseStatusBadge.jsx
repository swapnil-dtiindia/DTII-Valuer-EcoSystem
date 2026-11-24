import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/primitives';
import { CASE_STATUS } from '@/utils/caseStatus';

export function CaseStatusBadge({ status, overdue }) {
  const meta = CASE_STATUS[status] ?? { label: status, tone: 'neutral' };
  return (
    <span className="inline-flex items-center gap-1">
      <Badge tone={meta.tone} dot>
        {meta.label}
      </Badge>
      {overdue && (
        <Badge tone="danger">
          <AlertTriangle className="size-3" /> Overdue
        </Badge>
      )}
    </span>
  );
}
