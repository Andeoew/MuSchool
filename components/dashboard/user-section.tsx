'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/use-locale'
import { signOut, useSession } from '@/lib/auth-client'

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface UserSectionProps {
  collapsed?: boolean
  onSignOut?: () => void
  className?: string
}

export function UserSection({ collapsed, onSignOut, className }: UserSectionProps) {
  const router = useRouter()
  const { t } = useLocale()
  const { data: session, isPending } = useSession()

  const user = session?.user
  const initials = user?.name ? getInitials(user.name) : '??'

  async function handleSignOut() {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            onSignOut?.()
          },
          onError: () => {
            // Still leave the dashboard — session may already be cleared client-side.
            onSignOut?.()
          },
        },
      })
    } finally {
      // Always leave protected UI and refresh so the landing navbar re-fetches session.
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <div
        className={cn(
          'flex items-center gap-2.5 px-2.5 py-2 rounded-lg',
          collapsed && 'justify-center'
        )}
      >
        <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-background text-[10px] font-bold shrink-0">
          {isPending ? '…' : initials}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground truncate">
              {isPending ? '…' : (user?.name ?? '—')}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {isPending ? '…' : (user?.email ?? '—')}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        title={collapsed ? t.auth.signOut : undefined}
        className={cn(
          'flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full',
          collapsed && 'justify-center'
        )}
      >
        <LogOut className="w-[15px] h-[15px] shrink-0" strokeWidth={1.8} />
        {!collapsed && <span>{t.auth.signOut}</span>}
      </button>
    </div>
  )
}
