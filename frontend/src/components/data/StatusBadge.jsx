import { Badge } from '@/components/ui/primitives';
import { humanize } from '@/utils/format';

const TONE = {
  ACTIVE: 'success',
  INACTIVE: 'danger',
  INVITED: 'warning',
  DISABLED: 'danger',
  SUSPENDED: 'warning',
  DEACTIVATED: 'danger',
  TRIAL: 'info',
  EXPIRED: 'danger',
  CANCELLED: 'danger',
  LOCKED: 'danger',
};

const LABEL = { INVITED: 'Invite pending' };

/** Status pill used across lists and detail pages. */
export function StatusBadge({ status, label }) {
  return (
    <Badge tone={TONE[status] ?? 'neutral'} dot>
      {label ?? LABEL[status] ?? humanize(status)}
    </Badge>
  );
}
