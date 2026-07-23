'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const data = [
  { day: 'Pzt', present: 42, absent: 3 },
  { day: 'Sal', present: 38, absent: 6 },
  { day: 'Çar', present: 45, absent: 1 },
  { day: 'Per', present: 40, absent: 4 },
  { day: 'Cum', present: 35, absent: 8 },
  { day: 'Cmt', present: 28, absent: 2 },
]

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-xl px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${p.name === 'present' ? 'bg-emerald-500' : 'bg-rose-500'}`}
            aria-hidden="true"
          />
          <span className="text-muted-foreground">{p.name === 'present' ? 'Mevcut' : 'Yok'}:</span>
          <span className="text-foreground font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

interface AttendanceChartProps {
  title: string
  subtitle: string
}

export function AttendanceChart({ title, subtitle }: AttendanceChartProps) {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" /> Mevcut
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" aria-hidden="true" /> Yok
          </span>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={10} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-accent)', opacity: 0.5 }} />
            <Bar dataKey="present" radius={[4, 4, 0, 0]} fill="rgb(16 185 129)">
              {data.map((_, i) => <Cell key={i} fillOpacity={0.85} />)}
            </Bar>
            <Bar dataKey="absent" radius={[4, 4, 0, 0]} fill="rgb(244 63 94)">
              {data.map((_, i) => <Cell key={i} fillOpacity={0.75} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
