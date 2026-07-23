'use client'

// lib/i18n/locale-context.tsx
// Provides locale state and t() translation function to the entire app.

import { createContext, useState, useCallback, type ReactNode } from 'react'
import { tr } from './tr'
import { en } from './en'
import type { Translations } from './tr'

export type Locale = 'tr' | 'en'

const translations: Record<Locale, Translations> = { tr, en }

interface LocaleContextValue {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
  toggle: () => void
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('tr')

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])
  const toggle = useCallback(() => setLocaleState((prev) => (prev === 'tr' ? 'en' : 'tr')), [])

  return (
    <LocaleContext.Provider value={{ locale, t: translations[locale], setLocale, toggle }}>
      {children}
    </LocaleContext.Provider>
  )
}
