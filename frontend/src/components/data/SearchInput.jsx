import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/primitives';

/** Debounced (300 ms) search box. */
export function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  const [local, setLocal] = useState(value ?? '');
  useEffect(() => setLocal(value ?? ''), [value]);
  useEffect(() => {
    const t = setTimeout(() => local !== (value ?? '') && onChange(local), 300);
    return () => clearTimeout(t);
  }, [local, value, onChange]);
  return (
    <div className={cn('group relative w-full sm:w-72', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" aria-hidden />
      <Input aria-label={placeholder} value={local} onChange={(e) => setLocal(e.target.value)} placeholder={placeholder} className="pl-9" maxLength={100} />
    </div>
  );
}
