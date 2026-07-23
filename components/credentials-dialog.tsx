'use client'

import { useState } from 'react'
import { Check, Copy, X } from 'lucide-react'

export type IssuedCredential = {
  label?: string
  username: string
  temporaryPassword: string
}

type Props = {
  title?: string
  credentials: IssuedCredential | IssuedCredential[]
  onDone: () => void
}

export function CredentialsDialog({
  title = 'Account created',
  credentials,
  onDone,
}: Props) {
  const items = Array.isArray(credentials) ? credentials : [credentials]
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 1500)
    } catch {
      window.prompt('Copy this value:', value)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This password will only be shown once. Copy it now and share it securely.
            </p>
          </div>
          <button
            type="button"
            onClick={onDone}
            className="p-1 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {items.map((item, index) => (
          <div key={`${item.username}-${index}`} className="flex flex-col gap-3 rounded-xl border border-border p-3">
            {item.label && (
              <p className="text-[12px] font-semibold text-foreground uppercase tracking-wider">{item.label}</p>
            )}
            <CredentialRow
              label="Username"
              value={item.username}
              copied={copiedKey === `${index}-username`}
              onCopy={() => copy(`${index}-username`, item.username)}
            />
            <CredentialRow
              label="Temporary password"
              value={item.temporaryPassword}
              copied={copiedKey === `${index}-password`}
              onCopy={() => copy(`${index}-password`, item.temporaryPassword)}
            />
          </div>
        ))}

        <p className="text-[12px] text-amber-600 dark:text-amber-400">
          Passwords are stored hashed and cannot be viewed again. Use Reset Password if needed.
        </p>

        <button
          type="button"
          onClick={onDone}
          className="mt-1 self-end px-4 py-2 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function CredentialRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gold hover:underline underline-offset-4"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : `Copy ${label}`}
        </button>
      </div>
      <code className="block rounded-xl border border-border bg-muted px-3 py-2 text-sm font-mono text-foreground break-all">
        {value}
      </code>
    </div>
  )
}
