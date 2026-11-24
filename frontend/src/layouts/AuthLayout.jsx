import { FileSignature, FolderKanban, ShieldCheck } from 'lucide-react';
import { Outlet } from 'react-router';
import { Logo } from '@/components/layout/Logo';

const FEATURES = [
  { icon: FolderKanban, t: 'One Case ID, end to end', d: 'From the loan file to disbursement, every case has its own workflow and repository.' },
  { icon: FileSignature, t: 'Verified digital signatures', d: 'Final reports are signed with certificate-based signatures, with verification details kept on record.' },
  { icon: ShieldCheck, t: 'Complete audit trail', d: 'Every assignment, review, approval and submission is recorded and cannot be altered.' },
];

/** Split-screen layout for sign-in and public pages (shared visual identity with the DTII CA Ecosystem). */
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(0,93,248,0.55), transparent 65%)' }}
        />
        <Logo dark />
        <div className="relative mt-auto max-w-md">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#8eb8ff] uppercase">Property valuation platform</p>
          <h2 className="mt-3 text-4xl font-semibold leading-[1.15] tracking-tight">A digital trust ecosystem for valuers, clients and banks.</h2>
          <p className="mt-4 text-sidebar-foreground">
            Inspection, technical review, client approval, digital signature and bank submission, all in one traceable workflow.
          </p>
          <ul className="mt-10 space-y-5 text-sm">
            {FEATURES.map((f) => (
              <li key={f.t} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <f.icon className="size-4 text-[#7fb0ff]" />
                </span>
                <span>
                  <span className="block font-medium text-white">{f.t}</span>
                  <span className="text-sidebar-foreground/80">{f.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-12 text-xs text-sidebar-foreground/50">© {new Date().getFullYear()} DTII · Confidential valuation data. Authorised users only.</p>
      </section>
      <section className="auth-backdrop flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <Outlet />
          </div>
        </div>
      </section>
    </div>
  );
}
