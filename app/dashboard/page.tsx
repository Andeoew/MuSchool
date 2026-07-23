'use client'

import { useLocale } from '@/hooks/use-locale'
import { StatCards } from '@/components/dashboard/stat-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { AttendanceChart } from '@/components/dashboard/attendance-chart'
import { TodaysSchedule } from '@/components/dashboard/todays-schedule'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { UpcomingLessons } from '@/components/dashboard/upcoming-lessons'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { UpcomingBirthdays } from '@/components/dashboard/upcoming-birthdays'

export default function DashboardPage() {
  const { t } = useLocale()
  const d = t.dashboard

  // In production these come from Server Actions / SWR via hooks/use-dashboard-stats
  const today = new Date().toLocaleDateString(
    'tr-TR',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Welcome row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {d.greeting}, Sarah
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {d.subtitle('MuSchool')}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold-dim shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
          <span className="text-xs font-medium text-gold capitalize">{today}</span>
        </div>
      </div>

      {/* Stat cards */}
      <StatCards
        labels={{
          totalStudents: d.totalStudents,
          activeTeachers: d.activeTeachers,
          monthlyRevenue: d.monthlyRevenue,
          attendanceRate: d.attendanceRate,
          fromLastMonth: d.fromLastMonth,
        }}
      />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RevenueChart
          title={d.revenue}
          subtitle={d.revenueSubtitle}
          badge={`+8.4% ${d.thisMonth}`}
        />
        <AttendanceChart
          title={d.attendance}
          subtitle={d.attendanceSubtitle}
        />
      </div>

      {/* Schedule + Quick Actions */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        <TodaysSchedule
          title={d.todaysSchedule}
          subtitle={d.todaysScheduleSubtitle}
          viewCalendarLabel={d.viewCalendar}
        />
        <QuickActions
          title={d.quickActions}
          labels={{
            addStudent:    d.addStudent,
            addLesson:     d.addLesson,
            addTeacher:    d.addTeacher,
            recordPayment: d.recordPayment,
          }}
        />
      </div>

      {/* Activity + Upcoming Lessons */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RecentActivity title={d.recentActivity} />
        <UpcomingLessons
          title={d.upcomingLessons}
          viewAllLabel={d.viewAll}
        />
      </div>

      {/* Birthdays — full width on mobile, half on large */}
      <div className="grid lg:grid-cols-2 gap-4">
        <UpcomingBirthdays
          title={d.upcomingBirthdays}
          emptyLabel={d.noUpcomingBirthdays}
        />
      </div>
    </div>
  )
}
