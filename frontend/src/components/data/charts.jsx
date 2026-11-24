import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** Brand-led series colors. Order is stable so the same slice keeps the same hue across refreshes. */
export const CHART_COLORS = ['#005df8', '#0e7490', '#138a52', '#6366f1', '#b54708', '#64748b', '#0f766e', '#7c3aed'];

const tooltipStyle = {
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  boxShadow: 'var(--shadow-card)',
  fontSize: 12,
  color: 'var(--foreground)',
};

function ChartEmpty({ text }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>;
}

function short(label) {
  const text = String(label ?? '');
  return text.length > 22 ? `${text.slice(0, 20)}…` : text;
}

/**
 * Donut plus a readable legend. `items` are `{ key, name, value }` from existing aggregates.
 */
export function DonutBreakdown({ items, ariaLabel, emptyText = 'No data yet', format = (n) => n.toLocaleString('en-IN'), activeKeys, onSelect }) {
  const rows = items.filter((i) => i.value > 0);
  const total = rows.reduce((s, i) => s + i.value, 0);
  const focused = Array.isArray(activeKeys) && activeKeys.length > 0;
  if (!rows.length) return <ChartEmpty text={emptyText} />;
  const pick = (key) => onSelect?.(key);
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
      <div className="relative mx-auto h-48 w-full max-w-[200px]" role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="92%"
              paddingAngle={rows.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive
              animationDuration={700}
              style={{ cursor: onSelect ? 'pointer' : 'default' }}
              onClick={(entry) => pick(entry?.key ?? entry?.payload?.key)}
            >
              {rows.map((item, i) => (
                <Cell key={item.key ?? item.name} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={!focused || activeKeys.includes(item.key) ? 1 : 0.22} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [format(value), name]} contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-2xl font-semibold tracking-tight">{format(focused ? rows.filter((r) => activeKeys.includes(r.key)).reduce((s, r) => s + r.value, 0) : total)}</span>
          <span className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{focused ? 'Selected' : 'Total'}</span>
        </div>
      </div>
      <ul className="min-w-0 space-y-1" aria-label={ariaLabel}>
        {rows.map((item, i) => {
          const on = focused && activeKeys.includes(item.key);
          const dim = focused && !on;
          const row = (
            <>
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-left">{item.name}</span>
              <span className="tabular font-medium">{format(item.value)}</span>
              <span className="tabular w-10 text-right text-xs text-muted-foreground">{Math.round((item.value / total) * 100)}%</span>
            </>
          );
          return (
            <li key={item.key ?? item.name}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => pick(item.key)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${on ? 'bg-primary-soft text-foreground' : 'text-muted-foreground hover:bg-accent'} ${dim ? 'opacity-45' : ''}`}
                >
                  {row}
                </button>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Single-series area trend. `items` are `{ label, value }`. */
export function TrendArea({ items, ariaLabel, emptyText = 'No data yet', seriesName = 'Cases' }) {
  if (!items.length || items.every((i) => !i.value)) return <ChartEmpty text={emptyText} />;
  return (
    <div className="h-64 w-full min-w-0" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={items} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="intakeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#005df8" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#005df8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} width={32} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN'), seriesName]} labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }} contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="value" name={seriesName} stroke="#005df8" strokeWidth={2.25} fill="url(#intakeFill)" activeDot={{ r: 4 }} isAnimationActive animationDuration={700} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal comparison bars. `items` are `{ key, label, value }`. */
export function HorizontalBars({ items, ariaLabel, emptyText = 'No data yet', format = (n) => n.toLocaleString('en-IN'), seriesName = 'Value', color = '#005df8' }) {
  const rows = items.filter((i) => i.value > 0);
  if (!rows.length) return <ChartEmpty text={emptyText} />;
  return (
    <div className="w-full min-w-0" style={{ height: Math.max(168, rows.length * 36 + 12) }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={148} tickFormatter={short} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => [format(value), seriesName]} contentStyle={tooltipStyle} />
          <Bar dataKey="value" name={seriesName} fill={color} radius={[0, 5, 5, 0]} barSize={12} isAnimationActive animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Vertical comparison, useful for a short category list such as banks. */
export function ColumnChart({ items, ariaLabel, emptyText = 'No data yet', format = (n) => n.toLocaleString('en-IN'), seriesName = 'Value' }) {
  const rows = items.filter((i) => i.value > 0);
  if (!rows.length) return <ChartEmpty text={emptyText} />;
  return (
    <div className="h-64 w-full min-w-0" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tickFormatter={short} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip formatter={(value) => [format(value), seriesName]} contentStyle={tooltipStyle} />
          <Bar dataKey="value" name={seriesName} fill="#005df8" radius={[5, 5, 0, 0]} maxBarSize={36} isAnimationActive animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Stacked columns. `items` carry a `label` plus one numeric field per series key.
 * `series` is `{ key, label, color }[]`.
 */
export function StackedColumns({ items, series, ariaLabel, emptyText = 'No open assignments', activeId, onSelect }) {
  const hasValue = items.some((row) => series.some((s) => row[s.key] > 0));
  if (!items.length || !hasValue) return <ChartEmpty text={emptyText} />;
  return (
    <div className="h-72 w-full min-w-0" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tickFormatter={short} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={0} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={tooltipStyle} />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stackId="load"
              fill={s.color}
              maxBarSize={32}
              isAnimationActive
              animationDuration={700}
              onClick={(row) => onSelect?.(row?.id ?? row?.payload?.id)}
            >
              {items.map((row) => (
                <Cell key={row.id ?? row.label} fill={s.color} fillOpacity={!activeId || row.id === activeId ? 1 : 0.25} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
