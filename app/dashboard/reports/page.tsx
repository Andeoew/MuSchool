'use client'

import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const enrollmentData = [
  { month: 'Jan', students: 210 },
  { month: 'Feb', students: 218 },
  { month: 'Mar', students: 225 },
  { month: 'Apr', students: 232 },
  { month: 'May', students: 240 },
  { month: 'Jun', students: 244 },
  { month: 'Jul', students: 248 },
]

const revenueData = [
  { month: 'Jan', revenue: 9800, expenses: 4200 },
  { month: 'Feb', revenue: 10400, expenses: 4400 },
  { month: 'Mar', revenue: 11200, expenses: 4600 },
  { month: 'Apr', revenue: 10800, expenses: 4500 },
  { month: 'May', revenue: 12600, expenses: 4800 },
  { month: 'Jun', revenue: 13100, expenses: 5000 },
  { month: 'Jul', revenue: 14280, expenses: 5200 },
]

const attendanceData = [
  { month: 'Jan', rate: 91 },
  { month: 'Feb', rate: 92.5 },
  { month: 'Mar', rate: 93.2 },
  { month: 'Apr', rate: 90.1 },
  { month: 'May', rate: 94.8 },
  { month: 'Jun', rate: 93.6 },
  { month: 'Jul', rate: 94.2 },
]

const subjectData = [
  { subject: 'Piano', students: 88 },
  { subject: 'Guitar', students: 62 },
  { subject: 'Violin', students: 45 },
  { subject: 'Vocals', students: 28 },
  { subject: 'Drums', students: 18 },
  { subject: 'Other', students: 7 },
]

const tooltipStyle = {
  contentStyle: {
    background: 'var(--color-popover)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    fontSize: 11,
    color: 'var(--color-foreground)',
  },
  itemStyle: { color: 'var(--color-muted-foreground)' },
  labelStyle: { color: 'var(--color-foreground)', fontWeight: 600 },
}

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Reports & Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Year-to-date performance overview — 2026</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$81,180', sub: 'Jan–Jul 2026' },
          { label: 'Avg Attendance', value: '92.8%', sub: '7-month average' },
          { label: 'Student Growth', value: '+18.1%', sub: 'vs. Jan 2026' },
          { label: 'Avg Lesson Value', value: '$382', sub: 'per student/mo' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="flex flex-col gap-2 p-4 rounded-2xl border border-border bg-card">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-gold">{value}</p>
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Revenue vs Expenses */}
        <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Revenue vs. Expenses</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Monthly comparison</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="var(--color-muted-foreground)" opacity={0.4} radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment trend */}
        <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Student Enrollment</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Total active students over time</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} domain={[200, 260]} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="students" stroke="#D4AF37" strokeWidth={2} fill="url(#enrollGrad)" dot={{ r: 3, fill: '#D4AF37', strokeWidth: 0 }} name="Students" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        {/* Attendance rate */}
        <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Attendance Rate</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Monthly percentage of attended lessons</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} domain={[88, 96]} tickFormatter={(v) => `${v}%`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, 'Attendance']} />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5 }} name="Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students by subject */}
        <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Students by Subject</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Current enrollment breakdown</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {subjectData.map(({ subject, students: count }) => {
              const pct = Math.round((count / 248) * 100)
              return (
                <div key={subject} className="flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground w-14 shrink-0">{subject}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-medium text-foreground w-8 text-right shrink-0">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
