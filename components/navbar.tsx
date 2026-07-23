'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Music, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-client'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { data: session, isPending } = useSession()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const isLoggedIn = Boolean(session?.user)

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between" aria-label="Main navigation">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group" aria-label="Music Academy SaaS home">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold shadow-gold">
            <Music className="w-4 h-4 text-background" strokeWidth={2} />
          </span>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            MusicAcademy<span className="text-gold">Pro</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors duration-150"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          >
            {mounted ? (
              theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
            ) : (
              <span className="w-4 h-4 block" />
            )}
          </button>

          {!isPending && isLoggedIn ? (
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-background text-sm font-medium shadow-gold hover:brightness-110 transition-all duration-150"
            >
              Panele Git
            </a>
          ) : !isPending ? (
            <>
              <a
                href="/login"
                className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                Giriş Yap
              </a>

              <a
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-background text-sm font-medium shadow-gold hover:brightness-110 transition-all duration-150"
              >
                Kayıt Ol
              </a>
            </>
          ) : null}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 bg-background/95 backdrop-blur-xl border-b border-border',
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
            {!isPending && isLoggedIn ? (
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gold text-background text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Panele Git
              </a>
            ) : !isPending ? (
              <>
                <a
                  href="/login"
                  className="py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Giriş Yap
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gold text-background text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Kayıt Ol
                </a>
              </>
            ) : null}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mounted && (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
              {mounted ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : 'Toggle theme'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
