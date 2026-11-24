import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { notificationsApi } from '@/services/analyticsApi';
import { Skeleton } from '@/components/ui/primitives';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/overlays';
import { timeAgo } from '@/utils/format';

/** Header bell: unread count (polled every minute) and the latest notifications. */
export function NotificationBell() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: count } = useQuery({ queryKey: ['notifications', 'count'], queryFn: notificationsApi.unreadCount, refetchInterval: 60_000 });
  const { data, isLoading } = useQuery({ queryKey: ['notifications', 'latest'], queryFn: () => notificationsApi.list({ pageSize: 6 }), enabled: open });
  const read = useMutation({ mutationFn: (id) => notificationsApi.read(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
  const unread = count?.unread ?? 0;
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground active:scale-95 data-[state=open]:bg-accent data-[state=open]:text-foreground" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
        <Bell className="size-5" />
        {unread > 0 && <span className="tabular absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white">{unread > 99 ? '99+' : unread}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          <Link to="/notifications" className="text-xs font-medium text-primary hover:underline" onClick={() => setOpen(false)}>
            View all
          </Link>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="space-y-3 px-4 py-4" aria-busy="true" aria-label="Loading notifications">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          )}
          {data?.items.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>}
          {data?.items.map((n) => (
            <button
              key={n.id}
              className="block w-full border-b px-4 py-3 text-left last:border-0 hover:bg-accent"
              onClick={() => {
                setOpen(false);
                if (!n.readAt) read.mutate(n.id);
                if (n.link) navigate(n.link);
              }}
            >
              <span className="flex items-start gap-2">
                {!n.readAt && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{n.title}</span>
                  <span className="line-clamp-2 block text-xs text-muted-foreground">{n.body}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
