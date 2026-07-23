import {
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  BookOpen,
  Home,
  Monitor,
  Bell,
  BarChart3,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Student Management',
    description:
      'Maintain complete profiles for every student — enrollment history, contact details, lesson progress, and billing information in one unified view.',
  },
  {
    icon: GraduationCap,
    title: 'Teacher Management',
    description:
      'Onboard and manage teachers with dedicated profiles, availability calendars, pay rates, and performance reviews built right in.',
  },
  {
    icon: Calendar,
    title: 'Lesson Scheduling',
    description:
      'Drag-and-drop scheduler with conflict detection, recurring lessons, room assignments, and automatic reminders for students and teachers.',
  },
  {
    icon: CheckSquare,
    title: 'Attendance Tracking',
    description:
      'Mark attendance in seconds with one tap. Generate instant reports, spot patterns, and send automated alerts to parents when a lesson is missed.',
  },
  {
    icon: BookOpen,
    title: 'Homework Management',
    description:
      'Assign practice tasks, audio/video references, and sheet music directly to students. Track completion and give feedback — all in the platform.',
  },
  {
    icon: Home,
    title: 'Parent Portal',
    description:
      "Give parents real-time visibility into their child's schedule, attendance, homework, and billing — reducing admin calls and improving satisfaction.",
  },
  {
    icon: Monitor,
    title: 'Student Portal',
    description:
      'Students access their own dashboard to view upcoming lessons, download resources, submit practice recordings, and message their teacher.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Automated email and SMS notifications for lesson reminders, attendance alerts, payment due dates, and homework assignments.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description:
      'Visual dashboards and exportable reports on enrollment trends, revenue, attendance rates, and teacher performance — at a glance.',
  },
]

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <article className="group relative flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-gold/30 hover:bg-card transition-all duration-300">
      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-dim group-hover:bg-gold/20 transition-colors duration-300">
        <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
      </div>

      {/* Text */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Subtle corner accent */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-24 h-24 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }}
      />
    </article>
  )
}

export function Features() {
  return (
    <section id="features" className="relative py-28 overflow-hidden">
      {/* Section glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] opacity-[0.04] blur-3xl rounded-full"
        aria-hidden="true"
        style={{ background: '#D4AF37' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold-dim">
            <span className="text-xs font-medium text-gold tracking-wide">Everything you need</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance max-w-xl">
            Built for every corner of your academy
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl text-pretty">
            From the front desk to the practice room — every workflow your team relies on is handled by a single, cohesive platform.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
