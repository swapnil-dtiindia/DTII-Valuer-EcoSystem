import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MailCheck, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { smtpApi } from '@/services/analyticsApi';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, NativeSelect, Skeleton } from '@/components/ui/primitives';
import { PageHeader } from '@/components/data/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { ErrorState } from '@/components/data/States';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { formatDateTime, humanize } from '@/utils/format';

/** Firm email (SMTP) settings: platform default, Gmail SMTP (app password) or Microsoft 365 (OAuth2), plus delivery log. */
export default function EmailSettingsPage() {
  const { me } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['smtp'], queryFn: smtpApi.get });
  const logs = useQuery({ queryKey: ['smtp', 'logs'], queryFn: () => smtpApi.logs({ pageSize: 20 }) });
  const [v, setV] = useState({ provider: 'platform', user: '', from: '', tenantId: '', clientId: '', sender: '', secret: '' });
  const [testTo, setTestTo] = useState(me.user.email);
  useEffect(() => data && setV((x) => ({ ...x, provider: data.provider, ...data.config, secret: '' })), [data]);
  const save = useMutation({
    mutationFn: () => {
      const body =
        v.provider === 'gmail'
          ? { provider: 'gmail', user: v.user, ...(v.from ? { from: v.from } : {}), ...(v.secret ? { secret: v.secret } : {}) }
          : v.provider === 'office365'
            ? { provider: 'office365', tenantId: v.tenantId, clientId: v.clientId, sender: v.sender, ...(v.secret ? { secret: v.secret } : {}) }
            : { provider: 'platform' };
      return smtpApi.save(body);
    },
    onSuccess: (res) => {
      qc.setQueryData(['smtp'], res);
      toast.success('Email settings saved');
    },
    onError: (e) => toast.error(e.details?.join(' · ') ?? e.message),
  });
  const test = useMutation({
    mutationFn: () => smtpApi.test(testTo),
    onSuccess: (r) => (r.sent ? toast.success(`Test email sent via ${r.provider}`) : toast.error(`Sending failed: ${r.error}`)),
    onError: (e) => toast.error(e.message),
  });
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading) return <Skeleton className="h-96" />;
  const t = (k, label, props = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`smtp-${k}`}>{label}</Label>
      <Input id={`smtp-${k}`} value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} {...props} />
    </div>
  );
  return (
    <>
      <PageHeader title="Email settings" description="Workflow notifications are sent from your firm's own mailbox, or from the platform default." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sending account</CardTitle>
            <CardDescription>Passwords and client secrets are encrypted and can never be read back.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="smtp-provider">Provider</Label>
              <NativeSelect id="smtp-provider" value={v.provider} onChange={(e) => setV({ ...v, provider: e.target.value, secret: '' })}>
                <option value="platform">Platform default</option>
                <option value="gmail">Gmail / Google Workspace (SMTP + app password)</option>
                <option value="office365">Microsoft 365 (OAuth 2.0)</option>
              </NativeSelect>
            </div>
            {v.provider === 'gmail' && (
              <>
                {t('user', 'Gmail address', { type: 'email' })}
                {t('from', 'From (optional)', { placeholder: 'Firm Name <office@gmail.com>' })}
                <div className="space-y-1.5">
                  <Label htmlFor="smtp-secret">App password {data.hasSecret && data.provider === 'gmail' && <Badge tone="success">saved</Badge>}</Label>
                  <PasswordInput id="smtp-secret" value={v.secret} onChange={(e) => setV({ ...v, secret: e.target.value })} placeholder={data.hasSecret ? 'Leave blank to keep the saved one' : '16-character app password'} />
                  <p className="text-xs text-muted-foreground">Google account → Security → 2-Step Verification → App passwords.</p>
                </div>
              </>
            )}
            {v.provider === 'office365' && (
              <>
                {t('tenantId', 'Directory (tenant) ID')}
                {t('clientId', 'Application (client) ID')}
                {t('sender', 'Sender mailbox', { type: 'email' })}
                <div className="space-y-1.5">
                  <Label htmlFor="smtp-secret">Client secret {data.hasSecret && data.provider === 'office365' && <Badge tone="success">saved</Badge>}</Label>
                  <PasswordInput id="smtp-secret" value={v.secret} onChange={(e) => setV({ ...v, secret: e.target.value })} placeholder={data.hasSecret ? 'Leave blank to keep the saved one' : ''} />
                  <p className="text-xs text-muted-foreground">App registration with the SMTP.SendAsApp permission; SMTP AUTH enabled for the mailbox.</p>
                </div>
              </>
            )}
            <Button loading={save.isPending} onClick={() => save.mutate()}>
              Save
            </Button>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailCheck className="size-4" /> Send a test email
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Input aria-label="Test recipient" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
            <Button variant="outline" loading={test.isPending} onClick={() => test.mutate()}>
              <Send /> Send test
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Delivery log</CardTitle>
          </CardHeader>
          <DataTable
            columns={[
              { key: 'at', header: 'Queued', cell: (l) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(l.createdAt)}</span> },
              { key: 'to', header: 'To', cell: (l) => l.toMasked },
              { key: 'subject', header: 'Subject', cell: (l) => l.subject, className: 'hidden md:table-cell' },
              { key: 'via', header: 'Via', cell: (l) => l.provider ?? '—', className: 'hidden lg:table-cell' },
              { key: 'status', header: 'Status', cell: (l) => <Badge dot tone={l.status === 'SENT' ? 'success' : l.status === 'FAILED' ? 'danger' : 'warning'}>{humanize(l.status)}</Badge> },
            ]}
            rows={logs.data?.items}
            loading={logs.isLoading}
            error={logs.error}
          />
        </Card>
      </div>
    </>
  );
}
