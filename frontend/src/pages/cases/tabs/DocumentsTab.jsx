import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, FilePlus2, FileText, Folder, Image as ImageIcon, MessageSquarePlus, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { documentsApi } from '@/services/documentsApi';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, NativeSelect, Skeleton, Textarea } from '@/components/ui/primitives';
import { Dialog, DialogContent } from '@/components/ui/overlays';
import { EmptyState, ErrorState } from '@/components/data/States';
import { DocumentDrawer } from '@/components/documents/DocumentDrawer';
import { UploadDialog } from '@/components/documents/UploadDialog';
import { cn } from '@/utils/cn';
import { formatBytes, formatDate } from '@/utils/format';

function RequestDialog({ caseId, onClose }) {
  const qc = useQueryClient();
  const [v, setV] = useState({ title: '', description: '', requestedFrom: 'CLIENT', dueDate: '' });
  const m = useMutation({
    mutationFn: () => documentsApi.createRequest(caseId, { title: v.title, requestedFrom: v.requestedFrom, ...(v.description ? { description: v.description } : {}), ...(v.dueDate ? { dueDate: v.dueDate } : {}) }),
    onSuccess: () => {
      toast.success('Request recorded');
      qc.invalidateQueries({ queryKey: ['doc-requests', caseId] });
      qc.invalidateQueries({ queryKey: ['cases', 'detail', caseId] });
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent title="Request a document or clarification">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rq-title">What is needed?</Label>
            <Input id="rq-title" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="e.g. Latest property tax receipt" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rq-desc">Details</Label>
            <Textarea id="rq-desc" value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rq-from">Requested from</Label>
              <NativeSelect id="rq-from" value={v.requestedFrom} onChange={(e) => setV({ ...v, requestedFrom: e.target.value })}>
                <option value="CLIENT">Client (shown in portal)</option>
                <option value="BANK">Bank / NBFC</option>
                <option value="INTERNAL">Team (internal)</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rq-due">Needed by</Label>
              <Input id="rq-due" type="date" value={v.dueDate} onChange={(e) => setV({ ...v, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={v.title.trim().length < 2} loading={m.isPending} onClick={() => m.mutate()}>
              Send request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Requests({ c, can, isClient, onFulfil }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['doc-requests', c.id], queryFn: () => documentsApi.requests(c.id) });
  const cancel = useMutation({
    mutationFn: (id) => documentsApi.cancelRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doc-requests', c.id] }),
    onError: (e) => toast.error(e.message),
  });
  const items = data?.items ?? [];
  if (!items.length) return null;
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{isClient ? 'Documents requested from you' : 'Requested documents'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground">
                {r.description ? `${r.description} · ` : ''}from {r.requestedFrom.toLowerCase()}
                {r.dueDate ? ` · by ${formatDate(r.dueDate)}` : ''}
              </p>
            </div>
            <Badge dot tone={r.status === 'OPEN' ? 'warning' : r.status === 'FULFILLED' ? 'success' : 'danger'}>{r.status.toLowerCase()}</Badge>
            {r.status === 'OPEN' && (isClient || r.requestedFrom !== 'CLIENT') && (
              <Button size="sm" onClick={() => onFulfil(r)}>
                <Upload /> Upload
              </Button>
            )}
            {r.status === 'OPEN' && can('document.request') && !isClient && (
              <Button size="sm" variant="ghost" onClick={() => cancel.mutate(r.id)}>
                Cancel
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Case repository explorer: 10 numbered folders (only those readable by the user), versions, requests. */
export default function DocumentsTab({ c, can, isClient }) {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['documents', c.id], queryFn: () => documentsApi.tree(c.id) });
  const [folderCode, setFolderCode] = useState(null);
  const [openDoc, setOpenDoc] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [requesting, setRequesting] = useState(false);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading) return <Skeleton className="h-80" />;
  const folders = data.folders;
  const current = folders.find((f) => f.code === folderCode) ?? folders[0];
  const writable = folders.filter((f) => f.canWrite);

  return (
    <>
      <Requests c={c} can={can} isClient={isClient} onFulfil={(r) => setUploading({ requestId: r.id, defaultFolder: 'SOURCE_FILES' })} />
      <nav aria-label="Repository path" className="mb-3 flex flex-wrap items-center gap-1 font-mono text-xs text-muted-foreground">
        {data.path.map((p, i) => (
          <span key={p} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3" />} {p}
          </span>
        ))}
        {data.readOnly && <Badge className="ml-2">read-only (case closed)</Badge>}
      </nav>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit p-2">
          <ul className="space-y-0.5">
            {folders.map((f) => (
              <li key={f.code}>
                <button
                  onClick={() => setFolderCode(f.code)}
                  className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm', current.code === f.code ? 'bg-primary-soft font-medium text-primary' : 'hover:bg-accent')}
                >
                  <Folder className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">{f.label}</span>
                  <span className="tabular text-xs text-muted-foreground">{f.documents.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle>{current.title}</CardTitle>
            <div className="flex gap-2">
              {can('document.request') && !isClient && !data.readOnly && (
                <Button size="sm" variant="outline" onClick={() => setRequesting(true)}>
                  <MessageSquarePlus /> Request document
                </Button>
              )}
              {current.canWrite && (
                <Button size="sm" onClick={() => setUploading({ defaultFolder: current.code })}>
                  <FilePlus2 /> Upload
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {current.documents.length === 0 ? (
              <EmptyState title="No documents in this folder" description={current.canWrite ? 'Drag a file onto the upload dialog to add one.' : undefined} />
            ) : (
              <ul className="divide-y">
                {current.documents.map((d) => (
                  <li key={d.id}>
                    <button onClick={() => setOpenDoc(d)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-accent/60">
                      {d.current?.mimeType?.startsWith('image/') ? <ImageIcon className="size-5 text-primary" /> : <FileText className="size-5 text-primary" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{d.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          v{d.versionCount} · {d.current ? formatBytes(d.current.sizeBytes) : ''} · {d.uploadedBy ?? 'System'} · {formatDate(d.updatedAt)}
                        </span>
                      </span>
                      {!isClient && d.visibility === 'CLIENT' && <Badge tone="primary">client</Badge>}
                      {d.current && !d.current.downloadable && <Badge tone="warning">{d.current.scanStatus.toLowerCase()}</Badge>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      {openDoc && (
        <DocumentDrawer
          documentId={openDoc.id}
          canWrite={folders.find((f) => f.code === openDoc.folder)?.canWrite}
          onNewVersion={(d) => {
            setOpenDoc(null);
            setUploading({ documentId: d.id, documentTitle: d.title, defaultFolder: d.folder });
          }}
          onClose={() => setOpenDoc(null)}
        />
      )}
      {uploading && writable.length > 0 && <UploadDialog caseId={c.id} folders={uploading.documentId ? folders.filter((f) => f.code === uploading.defaultFolder) : writable} {...uploading} onClose={() => setUploading(null)} />}
      {requesting && <RequestDialog caseId={c.id} onClose={() => setRequesting(false)} />}
    </>
  );
}
