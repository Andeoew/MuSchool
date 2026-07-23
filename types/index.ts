// MuSchool — Shared TypeScript types

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT'
export type LessonStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
export type HomeworkStatus = 'PENDING' | 'SUBMITTED' | 'GRADED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  image?: string | null
  createdAt: Date
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  birthDate?: Date | null
  avatarUrl?: string | null
  level?: string | null
  instrument?: string | null
  isActive: boolean
  enrolledAt: Date
}

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  instruments: string[]
  isActive: boolean
  hiredAt: Date
}

export interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
}

export interface Lesson {
  id: string
  studentId: string
  teacherId: string
  subject: string
  level?: string | null
  startTime: Date
  endTime: Date
  status: LessonStatus
  notes?: string | null
}

export interface Payment {
  id: string
  studentId: string
  amount: number
  currency: string
  status: PaymentStatus
  description?: string | null
  paidAt?: Date | null
  dueDate?: Date | null
  createdAt: Date
}

export interface Announcement {
  id: string
  title: string
  body: string
  audience: string
  authorId?: string | null
  createdAt: Date
}

// Dashboard stat shape
export interface StatCard {
  key: string
  value: string | number
  change: string
  positive: boolean
}
