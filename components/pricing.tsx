'use client'

import { useState } from 'react'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Starter',
    tagline: 'Perfect for small studios just getting started.',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      'Up to 50 students',
      '5 teacher accounts',
      'Lesson scheduling',
      'Attendance tracking',
      'Basic reporting',
      'Email support',
    ],
    highlighted: false,
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    tagline: 'The full platform for growing academies.',
    monthlyPrice: 129,
    yearlyPrice: 99,
    features: [
      'Unlimited students',
      'Unlimited teachers',
      'All Starter features',
      'Homework management',
      'Parent & student portals',
      'Smart notifications (SMS + email)',
      'Advanced analytics',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    tagline: 'Custom solutions for large institutions.',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      'Everything in Professional',
      'Custom branding & domain',
      'API access & webhooks',
      'Multi-location management',
      'Dedicated account manager',
      'Custom integrations',
      'SLA & uptime guarantee',
      'Onboarding & training',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
]

export function Pricing() {
  const [isYearly, setIsYearly] = useState(true)

  return (
    <section id="pricing" className="relative py-28 overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute right-0 top-1/4 w-[600px] h-[600px] opacity-[0.05] blur-3xl rounded-full"
        aria-hidden="true"
        style={{ background: '#D4AF37' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-12 gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold-dim">
            <span className="text-xs font-medium text-gold tracking-wide">Simple pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            Plans that grow with your academy
          </h2>
          <p className="text-base text-muted-foreground max-w-md text-pretty">
            No hidden fees. Cancel anytime. All plans include a 14-day free trial — no credit card required.
          </p>

          {/* Toggle */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                'text-sm font-medium transition-colors duration-150',
                !isYearly ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              role="switch"
              aria-checked={isYearly}
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                'relative w-11 h-6 rounded-full border transition-colors duration-200',
                isYearly ? 'bg-gold border-gold' : 'bg-muted border-border'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform duration-200',
                  isYearly ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                'text-sm font-medium transition-colors duration-150',
                isYearly ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
            </button>
            {isYearly && (
              <span className="px-2 py-0.5 rounded-full bg-gold-dim border border-gold/30 text-gold text-[11px] font-semibold">
                Save 24%
              </span>
            )}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border p-7 transition-all duration-300',
                plan.highlighted
                  ? 'border-gold/60 bg-card shadow-gold shadow-xl scale-[1.02]'
                  : 'border-border bg-card hover:border-border/80'
              )}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold text-background text-[11px] font-bold shadow-gold">
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              {/* Plan name + tagline */}
              <div className="mb-6">
                <h3 className={cn('text-lg font-bold mb-1', plan.highlighted ? 'text-gold' : 'text-foreground')}>
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.monthlyPrice !== null ? (
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-foreground tracking-tight">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1.5">/mo</span>
                  </div>
                ) : (
                  <div className="text-3xl font-extrabold text-foreground tracking-tight">Custom</div>
                )}
                {plan.monthlyPrice !== null && isYearly && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed ${(plan.yearlyPrice! * 12).toLocaleString()} annually
                  </p>
                )}
              </div>

              {/* CTA */}
              <a
                href={plan.name === 'Enterprise' ? '#contact' : '/register'}
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 mb-7',
                  plan.highlighted
                    ? 'bg-gold text-background shadow-gold hover:brightness-110'
                    : 'bg-secondary text-foreground border border-border hover:border-gold/30 hover:bg-accent'
                )}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* Divider */}
              <div className="border-t border-border mb-6" />

              {/* Features */}
              <ul className="flex flex-col gap-3" role="list">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={cn('w-4 h-4 mt-0.5 shrink-0', plan.highlighted ? 'text-gold' : 'text-muted-foreground')}
                      strokeWidth={2.5}
                    />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans include 14-day free trial. No credit card required. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>
    </section>
  )
}
