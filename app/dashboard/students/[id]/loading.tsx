export default function StudentDetailLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-40 rounded-lg bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-xl bg-muted" />
          <div className="h-9 w-9 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 h-40" />
    </div>
  )
}
