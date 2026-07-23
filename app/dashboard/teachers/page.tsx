'use client'

import { useState } from 'react'
import { Search, UserPlus, Star, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const teachers = [
  { id: 1, name: 'Mr. David Clarke', email: 'dclarke@harmony.com', subjects: ['Piano', 'Violin'], students: 42, rating: 4.9, status: 'active', avatar: 'DC', joined: 'Jan 2021' },
  { id: 2, name: 'Ms. Elena Rivera', email: 'erivera@harmony.com', subjects: ['Guitar', 'Vocals'], students: 38, rating: 4.8, status: 'active', avatar: 'ER', joined: 'Mar 2021' },
  { id: 3, name: 'Ms. Amy Chen', email: 'achen@harmony.com', subjects: ['Drums', 'Percussion'], students: 24, rating: 4.7, status: 'active', avatar: 'AC', joined: 'Sep 2022' },
  { id: 4, name: 'Mr. James Foster', email: 'jfoster@harmony.com', subjects: ['Saxophone', 'Flute'], students: 19, rating: 4.6, status: 'active', avatar: 'JF', joined: 'Jun 2022' },
  { id: 5, name: 'Ms. Priya Kapoor', email: 'pkapoor@harmony.com', subjects: ['Vocals', 'Music Theory'], students: 31, rating: 4.9, status: 'active', avatar: 'PK', joined: 'Nov 2021' },
  { id: 6, name: 'Mr. Marcus Lee', email: 'mlee@harmony.com', subjects: ['Guitar', 'Bass'], students: 27, rating: 4.5, status: 'leave', avatar: 'ML', joined: 'Feb 2023' },
]

const avatarColors = ['bg-blue-500', 'bg-gold', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500']

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-gold text-gold" />
      <span className="text-[13px] font-medium text-foreground">{rating}</span>
    </div>
  )
}

export default function TeachersPage() {
  const [search, setSearch] = useState('')

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Teachers</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {teachers.length} staff members &bull; {teachers.filter(t => t.status === 'active').length} active
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95 self-start sm:self-auto">
          <UserPlus className="w-4 h-4" />
          Add Teacher
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search teachers or subjects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 rounded-xl border border-border bg-muted pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
        />
      </div>

      {/* Cards grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((teacher, i) => (
          <div
            key={teacher.id}
            className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card hover:border-gold/20 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white text-[13px] font-bold shrink-0', avatarColors[i % avatarColors.length])}>
                  {teacher.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{teacher.name}</p>
                  <p className="text-[11px] text-muted-foreground">{teacher.email}</p>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Subjects */}
            <div className="flex flex-wrap gap-1.5">
              {teacher.subjects.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
              <div className="text-center">
                <p className="text-[15px] font-bold text-foreground">{teacher.students}</p>
                <p className="text-[10px] text-muted-foreground">Students</p>
              </div>
              <div className="text-center">
                <RatingStars rating={teacher.rating} />
                <p className="text-[10px] text-muted-foreground mt-0.5">Rating</p>
              </div>
              <div className="text-center">
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                  teacher.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-amber-500/10 text-amber-500'
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', teacher.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500')} />
                  {teacher.status}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Status</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
