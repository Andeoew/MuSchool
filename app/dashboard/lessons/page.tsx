import { Suspense } from 'react'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { listLessons, type LessonListFilters } from './actions'
import { LessonsTable, type LessonRow } from './lessons-table'
import type { LessonStatusValue } from '@/lib/validations/lesson'

export const dynamic = 'force-dynamic'

type SearchParams = {
  q?: string
  teacherId?: string
  studentId?: string
  courseId?: string
  instrument?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  sort?: string
  sortDir?: string
}

function asStatus(v?: string): LessonStatusValue | 'ALL' | undefined {
  if (!v) return undefined
  const allowed = ['PLANNED', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'NO_SHOW'] as const
  return (allowed as readonly string[]).includes(v) ? (v as LessonStatusValue) : 'ALL'
}

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const filters: LessonListFilters = {
    search: params.q,
    teacherId: params.teacherId,
    studentId: params.studentId,
    courseId: params.courseId,
    instrument: params.instrument,
    status: asStatus(params.status),
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    sort:
      params.sort === 'teacher' || params.sort === 'student' || params.sort === 'course'
        ? params.sort
        : 'date',
    sortDir: params.sortDir === 'asc' ? 'asc' : 'desc',
  }

  try {
    const { academyId } = await requireAcademyId()
    const db = forAcademy(academyId)

    const [lessons, teachers, students, courses] = await Promise.all([
      listLessons(filters, academyId),
      db.teacher.findMany({
        where: { isActive: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        select: { id: true, firstName: true, lastName: true },
      }),
      db.student.findMany({
        where: { isActive: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        select: { id: true, firstName: true, lastName: true },
      }),
      db.course.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, instrument: true },
      }),
    ])

    const rows: LessonRow[] = lessons.map((l) => ({
      id: l.id,
      room: l.room,
      notes: l.notes,
      status: l.status,
      startTime: l.startTime.toISOString(),
      endTime: l.endTime.toISOString(),
      durationMinutes: l.durationMinutes,
      enrollmentId: l.enrollmentId,
      student: l.enrollment.student,
      teacher: l.enrollment.teacher,
      course: l.enrollment.course,
    }))

    const instruments = Array.from(new Set(courses.map((c) => c.instrument))).sort()

    return (
      <Suspense fallback={<div className="h-64 rounded-2xl bg-muted animate-pulse" />}>
        <LessonsTable
          lessons={rows}
          teachers={teachers.map((t) => ({
            id: t.id,
            label: `${t.firstName} ${t.lastName}`,
          }))}
          students={students.map((s) => ({
            id: s.id,
            label: `${s.firstName} ${s.lastName}`,
          }))}
          courses={courses.map((c) => ({
            id: c.id,
            label: c.name,
          }))}
          instruments={instruments}
          filters={{
            search: params.q ?? '',
            teacherId: params.teacherId ?? '',
            studentId: params.studentId ?? '',
            courseId: params.courseId ?? '',
            instrument: params.instrument ?? '',
            status: params.status ?? '',
            dateFrom: params.dateFrom ?? '',
            dateTo: params.dateTo ?? '',
            sort: filters.sort ?? 'date',
            sortDir: filters.sortDir ?? 'desc',
          }}
        />
      </Suspense>
    )
  } catch (err) {
    console.error('LessonsPage failed:', err)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 max-w-[1400px]">
        <p className="text-sm font-medium text-foreground">Could not load lessons.</p>
        <p className="text-sm text-muted-foreground">Please refresh the page or try again.</p>
      </div>
    )
  }
}
