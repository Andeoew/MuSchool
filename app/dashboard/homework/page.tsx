'use client'

import { useState } from 'react'
import { Plus, CheckCircle2, Clock, Circle, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const assignments = [
  { id: 1, title: 'C Major Scale Practice', student: 'Emma Thompson', subject: 'Piano', teacher: 'Mr. Clarke', due: 'Jul 19', status: 'submitted', submittedAt: 'Jul 17 10:30' },
  { id: 2, title: 'G Major & D Major Chord Transitions', student: 'James Wilson', subject: 'Guitar', teacher: 'Ms. Rivera', due: 'Jul 20', status: 'pending', submittedAt: null },
  { id: 3, title: 'Vivaldi Spring — Bars 1–24', student: 'Sofia Martínez', subject: 'Violin', teacher: 'Mr. Clarke', due: 'Jul 18', status: 'overdue', submittedAt: null },
  { id: 4, title: 'Basic 4/4 Drumming Pattern', student: 'Noah Park', subject: 'Drums', teacher: 'Ms. Chen', due: 'Jul 22', status: 'pending', submittedAt: null },
  { id: 5, title: 'Breathing Exercises & Warm-up Scales', student: 'Aisha Johnson', subject: 'Vocals', teacher: 'Ms. Rivera', due: 'Jul 21', status: 'submitted', submittedAt: 'Jul 16 15:45' },
  { id: 6, title: 'Finger Independence Drill — Hanon No.1', student: 'Luca Bianchi', subject: 'Piano', teacher: 'Mr. Clarke', due: 'Jul 23', status: 'pending', submittedAt: null },
  { id: 7, title: 'Pentatonic Scale Improvisation', student: 'Oliver Nguyen', subject: 'Guitar', teacher: 'Ms. Rivera', due: 'Jul 17', status: 'overdue', submittedAt: null },
  { id: 8, title: 'Mozart Sonata K.331 — First Movement', student: 'Isabella Kim', subject: 'Violin', teacher: 'Mr. Clarke', due: 'Jul 25', status: 'pending', submittedAt: null },
]

const statusConfig = {
  submitted: { label: 'Submitted', icon: CheckCircle2, classes: 'bg-emerald-500/10 text-emerald-500' },
  pending: { label: 'Pending', icon: Clock, classes: 'bg-amber-500/10 text-amber-500' },
  overdue: { label: 'Overdue', icon: Circle, classes: 'bg-rose-500/10 text-rose-500' },
}

type AssignmentStatus = 'submitted' | 'pending' | 'overdue'

export default function HomeworkPage() {
  const [filter, setFilter] = useState<'all' | AssignmentStatus>('all')

  const filtered = filter === 'all' ? assignments : assignments.filter((a) => a.status === filter)

  const counts = {
    submitted: assignments.filter((a) => a.status === 'submitted').length,
    pending: assignments.filter((a) => a.status === 'pending').length,
    overdue: assignments.filter((a) => a.status === 'overdue').length,
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Homework</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{assignments.length} total assignments</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Assign Homework
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(counts) as [AssignmentStatus, number][]).map(([key, count]) => {
          const cfg = statusConfig[key]
          const Icon = cfg.icon
          return (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? 'all' : key)}
              className={cn(
                'flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all',
                filter === key ? 'border-gold/40 bg-gold-dim' : 'border-border bg-card hover:border-gold/20'
              )}
            >
              <div className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider')}>
                <Icon className={cn('w-3.5 h-3.5', cfg.classes.split(' ')[1])} />
                <span className={cfg.classes.split(' ')[1]}>{cfg.label}</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Assignment cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((assignment) => {
          const cfg = statusConfig[assignment.status as AssignmentStatus]
          const Icon = cfg.icon
          return (
            <div
              key={assignment.id}
              className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card hover:border-gold/20 transition-all group"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold-dim shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4 text-gold" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-1">
                  <p className="text-[13px] font-semibold text-foreground">{assignment.title}</p>
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', cfg.classes)}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  {assignment.student} &bull; {assignment.subject} &bull; {assignment.teacher}
                </p>
                {assignment.submittedAt && (
                  <p className="text-[11px] text-emerald-500 mt-0.5">Submitted {assignment.submittedAt}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-muted-foreground">Due</p>
                <p className={cn('text-[12px] font-medium', assignment.status === 'overdue' ? 'text-rose-500' : 'text-foreground')}>
                  {assignment.due}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
