import { Music } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
    { label: 'Roadmap', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Support: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Contact', href: '#contact' },
    { label: 'Status', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <a href="#" className="flex items-center gap-2.5" aria-label="Music Academy SaaS home">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold shadow-gold">
                <Music className="w-4 h-4 text-background" strokeWidth={2} />
              </span>
              <span className="font-semibold text-sm text-foreground tracking-tight">
                MusicAcademy<span className="text-gold">Pro</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[180px]">
              The modern platform built for music academies.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              {['X', 'in', 'yt'].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors text-[11px] font-bold"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">{category}</p>
              <ul className="flex flex-col gap-2.5" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MusicAcademyPro. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with care for music educators worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}
