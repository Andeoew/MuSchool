'use client'

import { useState } from 'react'
import { CreditCard, TrendingUp, Clock, AlertCircle, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

const payments = [
  { id: 1, student: 'Emma Thompson', amount: 480, method: 'Card', date: 'Jul 15, 2026', status: 'paid', invoice: 'INV-2026-248' },
  { id: 2, student: 'Sofia Martínez', amount: 560, method: 'Bank Transfer', date: 'Jul 14, 2026', status: 'paid', invoice: 'INV-2026-247' },
  { id: 3, student: 'James Wilson', amount: 320, method: 'Card', date: 'Jul 12, 2026', status: 'paid', invoice: 'INV-2026-246' },
  { id: 4, student: 'Noah Park', amount: 400, method: 'Card', date: 'Jul 10, 2026', status: 'paid', invoice: 'INV-2026-245' },
  { id: 5, student: 'Aisha Johnson', amount: 360, method: 'Bank Transfer', date: 'Jul 5, 2026', status: 'paid', invoice: 'INV-2026-244' },
  { id: 6, student: 'Luca Bianchi', amount: 280, method: 'Card', date: 'Jul 3, 2026', status: 'paid', invoice: 'INV-2026-243' },
  { id: 7, student: 'Oliver Nguyen', amount: 320, method: 'Card', date: 'Jul 1, 2026', status: 'overdue', invoice: 'INV-2026-242' },
  { id: 8, student: 'Isabella Kim', amount: 440, method: 'Bank Transfer', date: 'Jun 28, 2026', status: 'pending', invoice: 'INV-2026-241' },
  { id: 9, student: 'Ethan Moore', amount: 280, method: 'Card', date: 'Jun 25, 2026', status: 'overdue', invoice: 'INV-2026-240' },
  { id: 10, student: 'Mia Chen', amount: 480, method: 'Card', date: 'Jun 20, 2026', status: 'paid', invoice: 'INV-2026-239' },
]

const statusConfig = {
  paid: { classes: 'bg-emerald-500/10 text-emerald-500' },
  pending: { classes: 'bg-amber-500/10 text-amber-500' },
  overdue: { classes: 'bg-rose-500/10 text-rose-500' },
}

type PaymentStatus = 'paid' | 'pending' | 'overdue'

export default function PaymentsPage() {
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all')

  const filtered = filter === 'all' ? payments : payments.filter((p) => p.status === filter)

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const pendingAmount = payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0)
  const overdueCount = payments.filter((p) => p.status === 'overdue').length

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Payments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Revenue and invoice tracking</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95 self-start sm:self-auto">
          <CreditCard className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Collected</p>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-500">This month</span>
        </div>
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">${pendingAmount.toLocaleString()}</p>
          <span className="text-[11px] text-amber-500">Pending collection</span>
        </div>
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overdue</p>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{overdueCount}</p>
          <span className="text-[11px] text-rose-500">Require follow-up</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'paid', 'pending', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3.5 py-2 rounded-lg text-xs font-medium capitalize transition-colors',
              filter === f
                ? 'bg-gold-dim text-gold border border-gold/30'
                : 'bg-muted text-muted-foreground hover:text-foreground border border-transparent'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Invoice', 'Student', 'Amount', 'Method', 'Date', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((payment) => {
                const cfg = statusConfig[payment.status as PaymentStatus]
                return (
                  <tr key={payment.id} className="hover:bg-accent/50 transition-colors group">
                    <td className="px-5 py-3.5 text-[12px] font-mono text-muted-foreground">{payment.invoice}</td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-foreground">{payment.student}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-foreground">${payment.amount}</td>
                    <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{payment.method}</td>
                    <td className="px-5 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">{payment.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium capitalize', cfg.classes)}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                        <Download className="w-3.5 h-3.5" />
                      </button>
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
