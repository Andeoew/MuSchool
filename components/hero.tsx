'use client'

import { ArrowRight, PlayCircle, Users, Calendar, CheckCircle2, TrendingUp, Bell } from 'lucide-react'

// Dashboard mockup built with pure JSX — no external images needed
function DashboardMockup() {
  return (
    <div className="relative w-full max-w-[620px] mx-auto">
      {/* Glow behind the card */}
      <div
        className="absolute -inset-px rounded-2xl opacity-30 blur-2xl"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, #D4AF37 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Browser chrome frame */}
      <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Window bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/80">
          <span className="w-3 h-3 rounded-full bg-border" />
          <span className="w-3 h-3 rounded-full bg-border" />
          <span className="w-3 h-3 rounded-full bg-border" />
          <div className="flex-1 mx-3">
            <div className="h-5 rounded-md bg-muted max-w-[220px] flex items-center px-3 gap-1.5">
              <span className="text-[10px] text-muted-foreground tracking-wide">app.musicacademypro.com</span>
            </div>
          </div>
        </div>

        {/* Dashboard layout */}
        <div className="flex h-[340px] md:h-[400px]">
          {/* Sidebar */}
          <div className="w-48 border-r border-border bg-background/60 flex flex-col p-3 gap-1 hidden sm:flex">
            <div className="px-2 py-1.5 mb-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Dashboard</p>
            </div>
            {[
              { icon: '⌂', label: 'Overview', active: true },
              { icon: '♪', label: 'Students' },
              { icon: '♬', label: 'Teachers' },
              { icon: '⊞', label: 'Schedule' },
              { icon: '✓', label: 'Attendance' },
              { icon: '📋', label: 'Homework' },
              { icon: '📊', label: 'Reports' },
            ].map(({ icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-default text-[11px] transition-colors ${
                  active
                    ? 'bg-gold-dim text-gold font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <span className="text-[13px] leading-none">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] text-muted-foreground">Thursday, Jul 17</p>
                <h3 className="text-sm font-semibold text-foreground">Good morning, Sarah</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold" />
                </div>
                <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-background text-[10px] font-bold">
                  SA
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Students', value: '248', trend: '+12', icon: Users },
                { label: 'Lessons Today', value: '18', trend: '+3', icon: Calendar },
                { label: 'Attendance', value: '94%', trend: '+2%', icon: CheckCircle2 },
              ].map(({ label, value, trend, icon: Icon }) => (
                <div key={label} className="bg-background rounded-xl p-2.5 border border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                    <Icon className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="text-base font-bold text-foreground leading-none">{value}</p>
                  <p className="text-[9px] text-gold mt-0.5">{trend} this week</p>
                </div>
              ))}
            </div>

            {/* Schedule snippet */}
            <div className="bg-background rounded-xl border border-border p-2.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-foreground">Today&apos;s Schedule</p>
                <p className="text-[9px] text-muted-foreground">View all →</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { time: '09:00', name: 'Emma Thompson', lesson: 'Piano — Level 3', color: 'bg-gold' },
                  { time: '10:30', name: 'James Wilson', lesson: 'Guitar — Beginner', color: 'bg-muted-foreground' },
                  { time: '12:00', name: 'Sofia Martínez', lesson: 'Violin — Advanced', color: 'bg-foreground' },
                ].map(({ time, name, lesson, color }) => (
                  <div key={time} className="flex items-center gap-2.5">
                    <span className="text-[9px] text-muted-foreground w-8 shrink-0">{time}</span>
                    <span className={`w-1 h-6 rounded-full shrink-0 ${color}`} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-foreground truncate">{name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{lesson}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — top right */}
      <div className="absolute -top-3 -right-3 bg-gold text-background text-[10px] font-bold px-2.5 py-1 rounded-full shadow-gold">
        Live Preview
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Subtle radial background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,55,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div className="flex flex-col items-start gap-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-medium text-gold tracking-wide">Built for Music Academies</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-foreground text-balance">
              Everything your music academy needs.{' '}
              <span className="text-gold">In one place.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg text-pretty">
              Manage students, teachers, schedules, attendance, homework and communication from a single modern platform — designed to help your academy thrive.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-background font-semibold text-sm shadow-gold hover:brightness-110 transition-all duration-200 active:scale-95"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-accent transition-all duration-200 active:scale-95"
              >
                <PlayCircle className="w-4 h-4 text-muted-foreground" />
                Book a Demo
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-border w-full">
              {/* Avatars */}
              <div className="flex -space-x-2">
                {['SA', 'MK', 'JL', 'AR', 'TC'].map((initials) => (
                  <div
                    key={initials}
                    className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-gold" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Trusted by <span className="text-foreground font-medium">500+</span> music academies worldwide
                </p>
              </div>
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="flex justify-center lg:justify-end">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
