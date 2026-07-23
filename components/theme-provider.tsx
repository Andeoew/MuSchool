'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// next-themes renders an inline <script> to prevent theme flicker on load.
// React 19 + Next.js 16.2 warns about any <script> tag rendered inside a
// component. This is a known false positive — the script runs correctly
// during SSR, next-themes just hasn't been updated for the new warning.
// See: https://github.com/pacocoursey/next-themes/issues/385
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) return;
    orig.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
