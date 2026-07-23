export default function StudentsLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded-lg bg-muted" />
          <div className="h-4 w-48 rounded-lg bg-muted" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-muted" />
      </div>
      <div className="h-9 max-w-sm rounded-xl bg-muted" />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="h-11 border-b border-border bg-muted/50" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-border last:border-0 px-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 rounded bg-muted" />
              <div className="h-2.5 w-28 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
