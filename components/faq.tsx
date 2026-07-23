'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'How does the 14-day free trial work?',
    answer:
      'You get full access to all features in your chosen plan for 14 days — no credit card required. At the end of the trial, you can choose to subscribe or your account is automatically paused. No charges, no surprises.',
  },
  {
    question: 'Can I migrate data from my existing software?',
    answer:
      'Yes. We provide a dedicated onboarding team and CSV import tools to help you migrate student records, teacher profiles, and historical data from spreadsheets or other platforms. Enterprise customers also get API access for automated migrations.',
  },
  {
    question: 'Is there a limit on the number of lessons I can schedule?',
    answer:
      'No. All plans — including Starter — support unlimited lesson scheduling. The only difference between plans is the number of active student and teacher accounts.',
  },
  {
    question: 'How does the parent portal work?',
    answer:
      "Parents receive a unique login that gives them a read-only view of their child's upcoming lessons, attendance history, assigned homework, and invoices. They can also receive automated notifications by email or SMS.",
  },
  {
    question: 'Does the platform support multiple locations or branches?',
    answer:
      "Multi-location management is available on the Enterprise plan. Each branch can have its own staff, rooms, and schedules while a central admin sees everything in one unified dashboard.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, Amex), as well as bank transfers for annual Enterprise contracts. All payments are processed securely through Stripe.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are SOC 2 Type II compliant and conduct regular third-party security audits. Your data is never sold or shared with third parties.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      'Yes, you can cancel anytime from your account settings. If you cancel a paid subscription, you retain access until the end of your current billing period. We do not charge cancellation fees.',
  },
]

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('border-b border-border', index === 0 && 'border-t')}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-foreground transition-colors leading-snug">
          {question}
        </span>
        <span className="flex items-center justify-center w-7 h-7 rounded-full border border-border shrink-0 text-muted-foreground group-hover:border-gold/40 group-hover:text-gold transition-all duration-200">
          {open ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </span>
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-muted-foreground leading-relaxed pb-5 max-w-2xl">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  return (
    <section id="faq" className="relative py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16">
          {/* Left label */}
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold-dim w-fit">
              <span className="text-xs font-medium text-gold tracking-wide">FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
              Questions we hear often
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed text-pretty">
              Not finding what you need? Reach out to our team — we typically respond within a few hours.
            </p>
            <a
              href="#contact"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline underline-offset-4 transition-colors"
            >
              Contact support →
            </a>
          </div>

          {/* Right accordion */}
          <div>
            {faqs.map((faq, i) => (
              <FaqItem key={i} index={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
