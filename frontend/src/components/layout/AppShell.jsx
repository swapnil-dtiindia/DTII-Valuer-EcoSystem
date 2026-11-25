import { ArrowLeftRight, Check, ChevronDown, LogOut, Menu, UserRound, X } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { homeFor, useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import { initials } from '@/utils/format';
import { PageSkeleton } from '@/components/ui/primitives';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/overlays';
import { Logo } from './Logo';
import { NAV } from './navConfig';
import { NotificationBell } from './NotificationBell';

function visibleNav(me) {
  const perms = me.context.permissions;
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => (!i.context || i.context === me.context.type) && (!i.any || i.any.some((p) => perms.includes(p)))),
  })).filter((g) => g.items.length);
}

function Sidebar({ me, onNavigate }) {
  const { pathname } = useLocation();
  const isActive = (item) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-white/8 px-5">
        <Logo dark />
      </div>
      <nav aria-label="Main" className="sidebar-scroll flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {visibleNav(me).map((g) => (
          <div key={g.section}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">{g.section}</p>
            <ul className="space-y-0.5">
              {g.items.map((i) => {
                const active = isActive(i);
                return (
                  <li key={i.href}>
                    <Link
                      to={i.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-[color,background-color,transform] duration-150 active:scale-[0.99]',
                        active ? 'bg-sidebar-active text-white' : 'text-sidebar-foreground/85 hover:bg-white/6 hover:text-white',
                      )}
                    >
                      {active && <span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-lime" aria-hidden />}
                      <i.icon className={cn('size-4 shrink-0 transition-transform duration-150 group-hover:scale-110', active ? 'text-lime' : 'text-sidebar-foreground/55 group-hover:text-white')} />
                      <span className="truncate">{i.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link to="/status" onClick={onNavigate} className="group block rounded-lg px-2 py-2 transition hover:bg-white/6">
          <p className="text-[11px] font-medium tracking-wide text-white/80">DTII Valuers Ecosystem</p>
          <p className="mt-0.5 text-[11px] text-sidebar-foreground/55 transition-colors group-hover:text-white">System status</p>
        </Link>
      </div>
    </div>
  );
}

function ContextSwitcher({ me, onSwitch }) {
  if (me.contexts.length < 2) return null;
  const activeId = me.context.type === 'PLATFORM' ? 'platform' : me.context.firm?.id;
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="flex items-center gap-1.5">
        <ArrowLeftRight className="size-3.5" /> Switch to
      </DropdownMenuLabel>
      {me.contexts.map((c) => (
        <DropdownMenuItem key={c.firmId} disabled={c.firmId === activeId} onSelect={() => onSwitch(c.firmId)}>
          {c.firmId === activeId ? <Check /> : <span className="size-4" />}
          <span className="min-w-0">
            <span className="block truncate">{c.label}</span>
            {c.firmCode && <span className="block text-xs text-muted-foreground">{c.firmCode}</span>}
          </span>
        </DropdownMenuItem>
      ))}
    </>
  );
}

/** Authenticated layout: fixed navy sidebar (drawer on mobile), sticky header, account menu. */
export default function AppShell() {
  const { me, logout, switchContext } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = me.context.type === 'PLATFORM' ? 'Platform administration' : me.context.firm.name;
  const roleLabel = me.context.roles.map((r) => r.name).join(' · ');

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] lg:block">
        <Sidebar me={me} />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[17rem] shadow-2xl">
            <Sidebar me={me} onNavigate={() => setMobileOpen(false)} />
            <button className="absolute top-4 right-3 rounded-md p-1 text-white transition hover:bg-white/10 active:scale-95" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[17rem]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 shadow-[0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md sm:px-6">
          <button className="rounded-lg p-2 transition hover:bg-accent active:scale-95 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          <Link to={homeFor(me)} className="min-w-0 rounded-lg px-2 py-1 transition hover:bg-accent">
            <p className="truncate text-sm font-semibold">
              {title}
              {me.context.firm && <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">{me.context.firm.firmCode}</span>}
            </p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            {me.context.type === 'FIRM' && <NotificationBell />}
            <DropdownMenu>
              <DropdownMenuTrigger className="group flex items-center gap-2 rounded-lg p-1.5 pr-2 transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring data-[state=open]:bg-accent" aria-label="Account menu">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{initials(me.user.fullName)}</span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-40 truncate text-sm font-medium leading-tight">{me.user.fullName}</span>
                  <span className="block max-w-40 truncate text-xs text-muted-foreground">{me.user.email}</span>
                </span>
                <ChevronDown className="hidden size-4 text-muted-foreground transition duration-150 group-data-[state=open]:rotate-180 sm:block" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>
                  Signed in as <span className="font-medium text-foreground">{me.user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account">
                    <UserRound /> My account & security
                  </Link>
                </DropdownMenuItem>
                <ContextSwitcher me={me} onSwitch={(id) => void switchContext(id)} />
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void logout()} className="text-destructive [&_svg]:text-destructive">
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[85rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
