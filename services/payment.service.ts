// services/payment.service.ts

import type { Payment } from '@/types'

// import { db } from '@/lib/db'

export async function getPayments(): Promise<Payment[]> {
  // return db.payment.findMany({ orderBy: { createdAt: 'desc' }, include: { student: true } })
  return []
}

export async function getPaymentsByStudentId(studentId: string): Promise<Payment[]> {
  // return db.payment.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } })
  return []
}

export async function getMonthlyRevenue(): Promise<number> {
  // const start = startOfMonth(new Date())
  // const result = await db.payment.aggregate({
  //   where: { status: 'PAID', paidAt: { gte: start } },
  //   _sum: { amount: true },
  // })
  // return result._sum.amount ?? 0
  return 0
}
