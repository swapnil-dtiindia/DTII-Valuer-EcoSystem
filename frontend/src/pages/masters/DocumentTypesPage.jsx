import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { mastersApi } from '@/services/casesApi';
import { Badge, Button, Card, Input, NativeSelect } from '@/components/ui/primitives';
import { PageHeader } from '@/components/data/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { FormAlert } from '@/components/forms/FormAlert';
import { FOLDERS } from '@/utils/folders';

const folderLabel = Object.fromEntries(FOLDERS.map((f) => [f.code, f.label]));

export default function DocumentTypesPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const [v, setV] = useState({ code: '', name: '', defaultFolder: 'SOURCE_FILES' });
  const [error, setError] = useState(null);
  const { data, isLoading, error: loadError, refetch } = useQuery({ queryKey: ['masters', 'document-types', 'all'], queryFn: () => mastersApi.documentTypes({ includeInactive: 'true' }) });
  const create = useMutation({
    mutationFn: () => mastersApi.createDocumentType(v),
    onSuccess: () => {
      toast.success('Document type added');
      setV({ code: '', name: '', defaultFolder: 'SOURCE_FILES' });
      setError(null);
      qc.invalidateQueries({ queryKey: ['masters'] });
    },
    onError: setError,
  });
  const toggle = useMutation({
    mutationFn: (d) => mastersApi.updateDocumentType(d.id, { active: !d.active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['masters'] }),
    onError: (e) => toast.error(e.message),
  });
  const columns = [
    { key: 'code', header: 'Code', cell: (d) => <span className="font-mono text-xs">{d.code}</span> },
    { key: 'name', header: 'Name', cell: (d) => <span className="flex items-center gap-1.5 font-medium">{d.name} {d.isPlatform && <Lock className="size-3.5 text-muted-foreground" aria-label="Platform type" />}</span> },
    { key: 'folder', header: 'Default folder', cell: (d) => <span className="font-mono text-xs">{folderLabel[d.defaultFolder]}</span> },
    {
      key: 'active',
      header: 'Status',
      cell: (d) =>
        d.isPlatform || !can('master.manage') ? (
          <Badge dot tone={d.active ? 'success' : 'danger'}>{d.active ? 'Active' : 'Inactive'}</Badge>
        ) : (
          <Button size="sm" variant="outline" onClick={() => toggle.mutate(d)}>
            {d.active ? 'Deactivate' : 'Activate'}
          </Button>
        ),
    },
  ];
  return (
    <>
      <PageHeader title="Document types" description="Used to classify uploads; each type files into a default repository folder." />
      {can('master.manage') && (
        <Card className="mb-6 space-y-3 p-4">
          <FormAlert error={error} />
          <div className="grid gap-2 sm:grid-cols-4">
            <Input aria-label="Code" placeholder="CODE" className="uppercase" value={v.code} onChange={(e) => setV({ ...v, code: e.target.value.toUpperCase() })} />
            <Input aria-label="Name" placeholder="Name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
            <NativeSelect aria-label="Default folder" value={v.defaultFolder} onChange={(e) => setV({ ...v, defaultFolder: e.target.value })}>
              {FOLDERS.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.label}
                </option>
              ))}
            </NativeSelect>
            <Button loading={create.isPending} disabled={!v.code || !v.name} onClick={() => create.mutate()}>
              <Plus /> Add type
            </Button>
          </div>
        </Card>
      )}
      <Card>
        <DataTable columns={columns} rows={data?.items} loading={isLoading} error={loadError} onRetry={refetch} />
      </Card>
    </>
  );
}
