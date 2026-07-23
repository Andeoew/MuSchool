export default function CoursesLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] animate-pulse">
      <div className="h-8 w-40 rounded-lg bg-muted" />
      <div className="h-9 w-full max-w-sm rounded-xl bg-muted" />
      <div className="h-64 rounded-2xl bg-muted" />
    </div>
  )
}
