import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, FileCode2, Plus, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mastersApi } from '@/services/casesApi';
import { templatesApi } from '@/services/valuationsApi';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, NativeSelect, Skeleton, Textarea } from '@/components/ui/primitives';
import { Dialog, DialogContent } from '@/components/ui/overlays';
import { PageHeader } from '@/components/data/PageHeader';
import { EmptyState, ErrorState } from '@/components/data/States';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/format';

const PLACEHOLDERS = [
  '{{firm.name}}',
  '{{case.caseNumber}}',
  '{{client.name}}',
  '{{bank.name}}',
  '{{category.name}}',
  '{{#each property.fields}}{{label}}: {{value}}{{/each}}',
  '{{inspection.date}} {{inspection.gps}}',
  '{{#each valuation.lines}}{{label}} {{inr amount}}{{/each}}',
  '{{inr valuation.marketValue}}',
  '{{valuation.marketValueWords}}',
  '{{inr valuation.realisableValue}} / {{inr valuation.distressValue}}',
  '{{people.valuer}} {{people.valuerRegistration}}',
  '<img src="{{verification.qr}}"> {{verification.code}}',
];

function NewTemplateDialog({ defaultBody, onCreated, onClose }) {
  const [v, setV] = useState({ name: '', description: '', bankId: '', categoryId: '' });
  const masters = useQuery({ queryKey: ['masters', 'template-scope'], queryFn: async () => ({ banks: (await mastersApi.banks({ pageSize: 100 })).items, categories: (await mastersApi.categories()).items }) });
  const m = useMutation({
    mutationFn: () => templatesApi.create({ name: v.name, ...(v.description ? { description: v.description } : {}), bankId: v.bankId || null, categoryId: v.categoryId || null, bodyHtml: defaultBody }),
    onSuccess: (t) => (toast.success('Template created from the default format'), onCreated(t)),
    onError: (e) => toast.error(e.message),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent title="New report template" description="Starts as a copy of the built-in format; edit it to match the lender's layout.">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">Name</Label>
            <Input id="tpl-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="e.g. SBI – Land & Building" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-bank">Lender</Label>
              <NativeSelect id="tpl-bank" value={v.bankId} onChange={(e) => setV({ ...v, bankId: e.target.value })}>
                <option value="">Any lender</option>
                {masters.data?.banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    {b.branch ? ` – ${b.branch}` : ''}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-cat">Category</Label>
              <NativeSelect id="tpl-cat" value={v.categoryId} onChange={(e) => setV({ ...v, categoryId: e.target.value })}>
                <option value="">Any category</option>
                {masters.data?.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={v.name.trim().length < 2} loading={m.isPending} onClick={() => m.mutate()}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Editor({ id }) {
  const qc = useQueryClient();
  const { data: t, isLoading } = useQuery({ queryKey: ['report-template', id], queryFn: () => templatesApi.get(id) });
  const [body, setBody] = useState('');
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState(null);
  useEffect(() => t && setBody(t.current?.bodyHtml ?? ''), [t]);
  const save = useMutation({
    mutationFn: () => templatesApi.addVersion(id, body, note || undefined),
    onSuccess: (res) => {
      qc.setQueryData(['report-template', id], res);
      qc.invalidateQueries({ queryKey: ['report-templates'] });
      setNote('');
      toast.success(`Saved as version ${res.versionCount}`);
    },
    onError: (e) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: () => templatesApi.update(id, { status: t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }),
    onSuccess: (res) => (qc.setQueryData(['report-template', id], res), qc.invalidateQueries({ queryKey: ['report-templates'] })),
  });
  const doPreview = useMutation({ mutationFn: () => templatesApi.preview(body), onSuccess: (r) => setPreview(r.html), onError: (e) => toast.error(e.message) });
  if (isLoading) return <Skeleton className="h-96" />;
  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            {t.name} <Badge dot tone={t.status === 'ACTIVE' ? 'success' : 'danger'}>{t.status.toLowerCase()}</Badge>
          </CardTitle>
          <CardDescription>
            v{t.versionCount} · history: {t.versions.map((v) => `v${v.version} ${formatDateTime(v.createdAt)}`).join(' · ')}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toggle.mutate()}>
            {t.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="outline" loading={doPreview.isPending} onClick={() => doPreview.mutate()}>
            <Eye /> Preview
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <details className="rounded-lg border p-3 text-xs">
          <summary className="cursor-pointer font-medium">Available placeholders</summary>
          <ul className="mt-2 grid gap-1 font-mono sm:grid-cols-2">
            {PLACEHOLDERS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="mt-2 text-muted-foreground">Rendering runs with JavaScript disabled and no network access; only inline images (data URLs) are allowed.</p>
        </details>
        <Textarea aria-label="Template HTML" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[420px] font-mono text-xs" spellCheck={false} />
        <div className="flex flex-wrap gap-2">
          <Input className="sm:w-80" placeholder="Change note" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Change note" />
          <Button loading={save.isPending} disabled={body === t.current?.bodyHtml} onClick={() => save.mutate()}>
            <Save /> Save new version
          </Button>
        </div>
      </CardContent>
      {preview && (
        <Dialog open onOpenChange={(o) => !o && setPreview(null)}>
          <DialogContent title="Preview with sample data" className="max-w-4xl">
            {/* sandbox="" blocks scripts, forms and navigation inside the preview */}
            <iframe title="Template preview" sandbox="" srcDoc={preview} className="h-[70vh] w-full rounded-lg border bg-white" />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

/** Report Template Master: bank / NBFC-specific report formats with version history. */
export default function ReportTemplatesPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['report-templates'], queryFn: templatesApi.list });
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <>
      <PageHeader
        title="Report templates"
        description="Bank / NBFC-specific valuation report formats. The most specific active template (lender + category) is used automatically."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> New template
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit p-2">
          {isLoading && <Skeleton className="h-40" />}
          {data?.items.length === 0 && <EmptyState icon={<FileCode2 className="size-5" />} title="No custom templates" description="Final reports use the built-in format until you add one." />}
          <ul className="space-y-0.5">
            {data?.items.map((t) => (
              <li key={t.id}>
                <button onClick={() => setSelected(t.id)} className={cn('w-full rounded-lg px-3 py-2 text-left text-sm', selected === t.id ? 'bg-primary-soft text-primary' : 'hover:bg-accent')}>
                  <span className="block font-medium">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t.bankName ?? 'Any lender'} · {t.categoryName ?? 'Any category'} · v{t.versionCount} {t.status === 'INACTIVE' ? '· inactive' : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        {selected ? <Editor id={selected} key={selected} /> : <EmptyState title="Select a template" description="Or create one from the built-in default format." />}
      </div>
      {creating && data && (
        <NewTemplateDialog
          defaultBody={data.defaultBody}
          onClose={() => setCreating(false)}
          onCreated={(t) => {
            setCreating(false);
            setSelected(t.id);
            refetch();
          }}
        />
      )}
    </>
  );
}
