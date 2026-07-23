'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Music2, Eye, EyeOff, ArrowRight, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLocale } from '@/hooks/use-locale'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { registerAcademy } from '@/app/actions/register-academy'
import { RegisterAcademySchema } from '@/lib/validations/auth'
import { resolvePostAuthRedirect } from '@/lib/auth-utils'

export default function RegisterPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { locale, toggle } = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [academyName, setAcademyName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = RegisterAcademySchema.safeParse({
      academyName,
      ownerName,
      email,
      password,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Lütfen tüm alanları doldurun.')
      return
    }

    setLoading(true)
    try {
      // 1. Create the Academy + the owner User (server-side, atomic)
      const result = await registerAcademy(parsed.data)
      if (result.error) {
        setError(result.error)
        return
      }

      // 2. Log the new owner in immediately (academy owners are ADMIN)
      const signInResult = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
      })

      if (signInResult.error) {
        setError(
          signInResult.error.message ||
            'Kayıt oluştu ama giriş başarısız oldu, lütfen giriş sayfasından dene.',
        )
        return
      }

      const role = (signInResult.data as { user?: { role?: string } } | undefined)?.user?.role
      if (!role) {
        setError('Kayıt oluştu ama oturum rolü alınamadı, lütfen giriş sayfasından dene.')
        return
      }
      router.push(resolvePostAuthRedirect(role))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden bg-card border-r border-border p-12">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--color-foreground) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold shadow-gold">
            <Music2 className="w-5 h-5 text-background" strokeWidth={2.2} />
          </span>
          <span className="font-bold text-lg tracking-tight text-foreground">
            Mu<span className="text-gold">School</span>
          </span>
        </div>

        <div className="relative flex flex-col gap-6 max-w-md">
          <blockquote className="text-xl font-medium text-foreground leading-relaxed text-balance">
            Akademini 5 dakikada dijitalleştir. Excel tablolarını unut, öğrenci, öğretmen ve ödemelerini tek yerden yönet.
          </blockquote>
        </div>

        <div className="relative grid grid-cols-3 gap-4 border-t border-border pt-8">
          <div className="flex flex-col gap-0.5">
            <p className="text-2xl font-bold text-foreground">14 gün</p>
            <p className="text-xs text-muted-foreground">Ücretsiz deneme</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-2xl font-bold text-foreground">Kredi kartı</p>
            <p className="text-xs text-muted-foreground">Gerekmez</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-2xl font-bold text-foreground">İstediğin an</p>
            <p className="text-xs text-muted-foreground">İptal et</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={toggle}
            className="px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors tracking-widest"
          >
            {locale === 'tr' ? 'EN' : 'TR'}
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {mounted ? (
              theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
            ) : (
              <span className="w-4 h-4 block" />
            )}
          </button>
        </div>

        <a href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold shadow-gold">
            <Music2 className="w-4.5 h-4.5 text-background" strokeWidth={2.2} />
          </span>
          <span className="font-bold text-base tracking-tight text-foreground">
            Mu<span className="text-gold">School</span>
          </span>
        </a>

        <div className="w-full max-w-[400px] flex flex-col gap-8">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Akademini oluştur</h1>
            <p className="text-sm text-muted-foreground">14 günlük ücretsiz deneme ile başla.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="academyName" className="text-sm font-medium text-foreground">
                Akademi adı
              </label>
              <input
                id="academyName"
                type="text"
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
                placeholder="Örn. Nota Müzik Akademisi"
                className="w-full h-11 rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 border-border focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ownerName" className="text-sm font-medium text-foreground">
                Adın soyadın
              </label>
              <input
                id="ownerName"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Adın Soyadın"
                className="w-full h-11 rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 border-border focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@akademi.com"
                className="w-full h-11 rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 border-border focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  className="w-full h-11 rounded-xl border bg-background px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 border-border focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

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
                  <span className="w-4 h-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  Akademini oluştur
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Zaten hesabın var mı?{' '}
            <a href="/login" className="text-gold font-medium hover:underline underline-offset-4 transition-colors">
              Giriş yap
            </a>
          </p>

          <a
            href="/"
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Siteye dön
          </a>
        </div>
      </div>
    </div>
  )
}
