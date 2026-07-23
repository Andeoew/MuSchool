'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Music2, Eye, EyeOff, ArrowRight, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLocale } from '@/hooks/use-locale'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { SignInSchema } from '@/lib/validations/auth'
import { resolvePostAuthRedirect } from '@/lib/auth-utils'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()
  const { t, locale, toggle } = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = SignInSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t.auth.fillAllFields)
      return
    }

    setLoading(true)

    try {
      const result = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
        rememberMe,
      })

      if (result.error) {
        const status = result.error.status
        if (status === 401 || status === 403) {
          setError(t.auth.invalidCredentials)
        } else {
          setError(result.error.message || t.auth.invalidCredentials)
        }
        return
      }

      const role = (result.data as { user?: { role?: string } } | undefined)?.user?.role
      if (!role) {
        setError(t.auth.invalidCredentials)
        return
      }

      router.push(resolvePostAuthRedirect(role, searchParams.get('callbackUrl')))
      router.refresh()
    } catch {
      setError(t.auth.invalidCredentials)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { value: '500+', label: t.auth.statAcademies },
    { value: '50k+', label: t.auth.statStudents },
    { value: '99.9%', label: t.auth.statUptime },
  ]

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden bg-card border-r border-border p-12">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)',
          }}
        />
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--color-foreground) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold shadow-gold">
            <Music2 className="w-5 h-5 text-background" strokeWidth={2.2} />
          </span>
          <span className="font-bold text-lg tracking-tight text-foreground">
            Mu<span className="text-gold">School</span>
          </span>
        </div>

        {/* Quote */}
        <div className="relative flex flex-col gap-6 max-w-md">
          <div className="text-5xl font-bold text-gold leading-none select-none">&ldquo;</div>
          <blockquote className="text-xl font-medium text-foreground leading-relaxed text-balance">
            {t.auth.quote}
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-dim border border-gold/30 flex items-center justify-center text-xs font-bold text-gold shrink-0">
              SR
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.auth.quoteName}</p>
              <p className="text-xs text-muted-foreground">{t.auth.quoteTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1" aria-label="5 yıldız değerlendirme">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="w-4 h-4 fill-gold" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4 border-t border-border pt-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Top-right controls */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={t.topnav.toggleLanguage}
            className="px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors tracking-widest"
          >
            {locale === 'tr' ? 'EN' : 'TR'}
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t.topnav.toggleTheme}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {mounted ? (
              theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
            ) : (
              <span className="w-4 h-4 block" />
            )}
          </button>
        </div>

        {/* Mobile logo */}
        <a href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold shadow-gold">
            <Music2 className="w-4.5 h-4.5 text-background" strokeWidth={2.2} />
          </span>
          <span className="font-bold text-base tracking-tight text-foreground">
            Mu<span className="text-gold">School</span>
          </span>
        </a>

        <div className="w-full max-w-[400px] flex flex-col gap-8">
          {/* Heading */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t.auth.welcomeBack}</h1>
            <p className="text-sm text-muted-foreground">{t.auth.signInToDashboard}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                {t.auth.email}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                className={cn(
                  'w-full h-11 rounded-xl border bg-background px-4 text-sm text-foreground',
                  'placeholder:text-muted-foreground/60 border-border',
                  'focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all'
                )}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  {t.auth.password}
                </label>
                <a href="#" className="text-xs text-gold hover:underline underline-offset-4 transition-colors">
                  {t.auth.forgotPassword}
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className={cn(
                    'w-full h-11 rounded-xl border bg-background px-4 pr-11 text-sm text-foreground',
                    'placeholder:text-muted-foreground/60 border-border',
                    'focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <button
                type="button"
                role="checkbox"
                aria-checked={rememberMe}
                onClick={() => setRememberMe(!rememberMe)}
                className={cn(
                  'w-[18px] h-[18px] rounded-md border flex items-center justify-center transition-all shrink-0',
                  rememberMe ? 'bg-gold border-gold' : 'bg-transparent border-border group-hover:border-gold/50'
                )}
              >
                {rememberMe && (
                  <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">
                {t.auth.rememberMe}
              </span>
            </label>

            {/* Error */}
            {error && (
              <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full h-11 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold',
                'inline-flex items-center justify-center gap-2',
                'hover:brightness-110 transition-all duration-200 active:scale-[0.98]',
                loading && 'opacity-80 cursor-not-allowed'
              )}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-background/30 border-t-background animate-spin" aria-hidden="true" />
                  {t.auth.signingIn}
                </>
              ) : (
                <>
                  {t.auth.signIn}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">veya</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sign up */}
          <p className="text-center text-sm text-muted-foreground">
            {t.auth.noAccount}{' '}
            <a href="/register" className="text-gold font-medium hover:underline underline-offset-4 transition-colors">
              {t.auth.startTrial}
            </a>
          </p>

          {/* Back */}
          <a
            href="/"
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; {t.auth.backToSite}
          </a>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="h-9 w-40 rounded-xl bg-muted animate-pulse" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
