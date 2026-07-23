'use client'

import { useState } from 'react'
import { Save, Bell, Shield, Globe, CreditCard, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Section = 'academy' | 'notifications' | 'security' | 'billing' | 'team'

const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'academy', label: 'Academy Profile', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'team', label: 'Team Access', icon: Users },
]

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-5.5 rounded-full border transition-colors duration-200 shrink-0',
        checked ? 'bg-gold border-gold' : 'bg-muted border-border'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform duration-200',
          checked ? 'translate-x-4.5' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        {description && <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('academy')
  const [notifs, setNotifs] = useState({
    lessonReminders: true,
    attendanceAlerts: true,
    paymentDue: true,
    homeworkSubmitted: false,
    weeklyReport: true,
    marketingEmails: false,
  })
  const [academyName, setAcademyName] = useState('Harmony Music Academy')
  const [academyEmail, setAcademyEmail] = useState('info@harmonyacademy.com')
  const [timezone, setTimezone] = useState('Europe/London')

  return (
    <div className="flex flex-col gap-6 max-w-[900px]">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your academy preferences and account</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="flex md:flex-col gap-1 md:w-48 shrink-0 overflow-x-auto md:overflow-visible" aria-label="Settings navigation">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors text-left whitespace-nowrap',
                activeSection === id
                  ? 'bg-gold-dim text-gold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', activeSection === id ? 'text-gold' : 'text-muted-foreground')} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 rounded-2xl border border-border bg-card p-6">
          {activeSection === 'academy' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Academy Profile</h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Academy Name', value: academyName, setter: setAcademyName, type: 'text' },
                  { label: 'Contact Email', value: academyEmail, setter: setAcademyEmail, type: 'email' },
                ].map(({ label, value, setter, type }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground uppercase tracking-wider">{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="h-10 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground uppercase tracking-wider">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="h-10 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
                  >
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  </select>
                </div>
              </div>
              <button className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-foreground pb-3 border-b border-border mb-2">Email Notifications</h3>
              <SettingRow label="Lesson reminders" description="Send reminders 24h before each scheduled lesson">
                <ToggleSwitch checked={notifs.lessonReminders} onChange={(v) => setNotifs((p) => ({ ...p, lessonReminders: v }))} />
              </SettingRow>
              <SettingRow label="Attendance alerts" description="Alert when a student is marked absent">
                <ToggleSwitch checked={notifs.attendanceAlerts} onChange={(v) => setNotifs((p) => ({ ...p, attendanceAlerts: v }))} />
              </SettingRow>
              <SettingRow label="Payment due reminders" description="Notify students 7 days before invoice due date">
                <ToggleSwitch checked={notifs.paymentDue} onChange={(v) => setNotifs((p) => ({ ...p, paymentDue: v }))} />
              </SettingRow>
              <SettingRow label="Homework submissions" description="Notify teacher when homework is submitted">
                <ToggleSwitch checked={notifs.homeworkSubmitted} onChange={(v) => setNotifs((p) => ({ ...p, homeworkSubmitted: v }))} />
              </SettingRow>
              <SettingRow label="Weekly summary report" description="Receive a digest every Monday morning">
                <ToggleSwitch checked={notifs.weeklyReport} onChange={(v) => setNotifs((p) => ({ ...p, weeklyReport: v }))} />
              </SettingRow>
              <SettingRow label="Marketing emails" description="Product updates, tips, and announcements">
                <ToggleSwitch checked={notifs.marketingEmails} onChange={(v) => setNotifs((p) => ({ ...p, marketingEmails: v }))} />
              </SettingRow>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-semibold text-foreground pb-3 border-b border-border">Security</h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground uppercase tracking-wider">Current password</label>
                  <input type="password" placeholder="••••••••" className="h-10 rounded-xl border border-border bg-background px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground uppercase tracking-wider">New password</label>
                  <input type="password" placeholder="••••••••" className="h-10 rounded-xl border border-border bg-background px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground uppercase tracking-wider">Confirm new password</label>
                  <input type="password" placeholder="••••••••" className="h-10 rounded-xl border border-border bg-background px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all" />
                </div>
              </div>
              <button className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95">
                <Save className="w-4 h-4" />
                Update Password
              </button>
              <div className="pt-2 border-t border-border">
                <SettingRow label="Two-factor authentication" description="Add an extra layer of security to your account">
                  <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors">
                    Enable 2FA
                  </button>
                </SettingRow>
              </div>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-semibold text-foreground pb-3 border-b border-border">Billing & Subscription</h3>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gold/30 bg-gold-dim">
                <div>
                  <p className="text-sm font-semibold text-foreground">Professional Plan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">$99/month &bull; Billed annually &bull; Renews Aug 1, 2026</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-medium">Active</span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment method</p>
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/50">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Visa ending in 4242</p>
                    <p className="text-[11px] text-muted-foreground">Expires 12/2027</p>
                  </div>
                  <button className="ml-auto text-xs text-gold hover:underline underline-offset-4">Update</button>
                </div>
              </div>
              <button className="self-start px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors">
                Cancel subscription
              </button>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-semibold text-foreground pb-3 border-b border-border">Team Access</h3>
              <div className="flex flex-col divide-y divide-border">
                {[
                  { name: 'Sarah Admin', email: 'sarah@harmony.com', role: 'Owner', avatar: 'SA' },
                  { name: 'Mr. David Clarke', email: 'dclarke@harmony.com', role: 'Teacher', avatar: 'DC' },
                  { name: 'Ms. Elena Rivera', email: 'erivera@harmony.com', role: 'Teacher', avatar: 'ER' },
                  { name: 'Ms. Amy Chen', email: 'achen@harmony.com', role: 'Teacher', avatar: 'AC' },
                ].map(({ name, email, role, avatar }) => (
                  <div key={email} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-background text-[10px] font-bold shrink-0">
                      {avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground">{name}</p>
                      <p className="text-[11px] text-muted-foreground">{email}</p>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{role}</span>
                  </div>
                ))}
              </div>
              <button className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95">
                <Users className="w-4 h-4" />
                Invite Member
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
