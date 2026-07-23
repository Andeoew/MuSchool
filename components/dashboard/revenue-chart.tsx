'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const data = [
  { month: 'Oca', revenue: 32500, target: 33000 },
  { month: 'Şub', revenue: 35800, target: 34000 },
  { month: 'Mar', revenue: 38200, target: 36000 },
  { month: 'Nis', revenue: 37100, target: 37000 },
  { month: 'May', revenue: 41600, target: 39000 },
  { month: 'Haz', revenue: 44300, target: 42000 },
  { month: 'Tem', revenue: 47850, target: 44000 },
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
            className={`w-2 h-2 rounded-full shrink-0 ${p.name === 'revenue' ? 'bg-gold' : 'bg-border'}`}
            aria-hidden="true"
          />
          <span className="text-muted-foreground">{p.name === 'revenue' ? 'Gelir' : 'Hedef'}:</span>
          <span className="text-foreground font-medium">₺{p.value.toLocaleString('tr-TR')}</span>
        </div>
      ))}
    </div>
  )
}

interface RevenueChartProps {
  title: string
  subtitle: string
  badge: string
}

export function RevenueChart({ title, subtitle, badge }: RevenueChartProps) {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full shrink-0">
          {badge}
        </span>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#888" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#888" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="target" stroke="var(--color-border)" strokeWidth={1.5}
              fill="url(#targetGrad)" strokeDasharray="4 4" dot={false} />
            <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={{ r: 3, fill: '#D4AF37', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#D4AF37', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
