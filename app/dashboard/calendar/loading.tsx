export default function CalendarLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] animate-pulse">
      <div className="flex justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded-lg bg-muted" />
          <div className="h-4 w-48 rounded-lg bg-muted" />
        </div>
        <div className="h-10 w-40 rounded-xl bg-muted" />
      </div>
      <div className="rounded-2xl border border-border bg-card h-[640px]" />
    </div>
  )
}
