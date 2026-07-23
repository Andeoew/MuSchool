'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const records = [
  { id: 1, student: 'Emma Thompson', teacher: 'Mr. Clarke', subject: 'Piano', time: '09:00', status: 'absent', date: 'Jul 17' },
  { id: 2, student: 'James Wilson', teacher: 'Ms. Rivera', subject: 'Guitar', time: '10:00', status: 'present', date: 'Jul 17' },
  { id: 3, student: 'Sofia Martínez', teacher: 'Mr. Clarke', subject: 'Violin', time: '11:30', status: 'present', date: 'Jul 17' },
  { id: 4, student: 'Noah Park', teacher: 'Ms. Chen', subject: 'Drums', time: '13:00', status: 'late', date: 'Jul 17' },
  { id: 5, student: 'Aisha Johnson', teacher: 'Ms. Rivera', subject: 'Vocals', time: '14:30', status: 'present', date: 'Jul 17' },
  { id: 6, student: 'Luca Bianchi', teacher: 'Mr. Clarke', subject: 'Piano', time: '16:00', status: 'present', date: 'Jul 17' },
  { id: 7, student: 'Mia Chen', teacher: 'Mr. Clarke', subject: 'Piano', time: '09:00', status: 'present', date: 'Jul 16' },
  { id: 8, student: 'Oliver Nguyen', teacher: 'Ms. Rivera', subject: 'Guitar', time: '10:30', status: 'absent', date: 'Jul 16' },
  { id: 9, student: 'Isabella Kim', teacher: 'Mr. Clarke', subject: 'Violin', time: '12:00', status: 'present', date: 'Jul 16' },
  { id: 10, student: 'Ethan Moore', teacher: 'Ms. Chen', subject: 'Drums', time: '14:00', status: 'late', date: 'Jul 16' },
]

const statusConfig = {
  present: { label: 'Present', icon: CheckCircle2, classes: 'bg-emerald-500/10 text-emerald-500', iconClass: 'text-emerald-500' },
  absent: { label: 'Absent', icon: XCircle, classes: 'bg-rose-500/10 text-rose-500', iconClass: 'text-rose-500' },
  late: { label: 'Late', icon: Clock, classes: 'bg-amber-500/10 text-amber-500', iconClass: 'text-amber-500' },
}

type AttendanceStatus = 'present' | 'absent' | 'late'

export default function AttendancePage() {
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>(
    Object.fromEntries(records.map((r) => [r.id, r.status as AttendanceStatus]))
  )
  const [dateFilter, setDateFilter] = useState('Jul 17')

  const filtered = records.filter((r) => r.date === dateFilter)
  const dates = [...new Set(records.map((r) => r.date))]

  const summary = {
    present: filtered.filter((r) => statuses[r.id] === 'present').length,
    absent: filtered.filter((r) => statuses[r.id] === 'absent').length,
    late: filtered.filter((r) => statuses[r.id] === 'late').length,
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Attendance</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Track and update daily lesson attendance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Present', count: summary.present, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Absent', count: summary.absent, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Late', count: summary.late, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className="flex flex-col gap-2 p-4 rounded-2xl border border-border bg-card">
            <span className={cn('text-[11px] font-semibold uppercase tracking-wider', color)}>{label}</span>
            <span className={cn('text-3xl font-bold', color)}>{count}</span>
          </div>
        ))}
      </div>

      {/* Date tabs */}
      <div className="flex items-center gap-2">
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => setDateFilter(d)}
            className={cn(
              'px-3.5 py-2 rounded-lg text-xs font-medium transition-colors',
              dateFilter === d
                ? 'bg-gold-dim text-gold border border-gold/30'
                : 'bg-muted text-muted-foreground hover:text-foreground border border-transparent'
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Student', 'Subject', 'Teacher', 'Time', 'Status', 'Update'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((record) => {
                const status = statuses[record.id]
                const cfg = statusConfig[status]
                const Icon = cfg.icon
                return (
                  <tr key={record.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-foreground">{record.student}</td>
                    <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{record.subject}</td>
                    <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{record.teacher}</td>
                    <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{record.time}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', cfg.classes)}>
                        <Icon className={cn('w-3 h-3', cfg.iconClass)} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {(['present', 'absent', 'late'] as AttendanceStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => setStatuses((prev) => ({ ...prev, [record.id]: s }))}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-[10px] font-medium capitalize transition-colors',
                              status === s
                                ? statusConfig[s].classes + ' border border-current/20'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
