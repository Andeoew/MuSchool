'use client'

// hooks/use-locale.ts — Consumes the LocaleContext for easy access in components

import { useContext } from 'react'
import { LocaleContext } from '@/lib/i18n/locale-context'

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}
