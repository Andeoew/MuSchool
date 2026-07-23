/**
 * Deterministic date/time formatters — fixed locale, no SSR/client drift.
 * Prefer these over `toLocaleDateString()` / `toLocaleTimeString()` in RSC + client.
 */

function pad(n: number) {
  return String(n).padStart(2, '0')
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** HH:mm — local wall clock, no locale API. */
export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** e.g. "Jan 5, 2026" */
export function formatDateShort(date: Date): string {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

/** e.g. "Mon, Jan 5" */
export function formatDateMedium(date: Date): string {
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`
}

/** e.g. "January 5" (month + day only) */
export function formatMonthDay(date: Date): string {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`
}

/** e.g. "Jan 2026" */
export function formatMonthYear(date: Date): string {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`
}

/** e.g. "Thursday, 23 July 2026" — stable long label for dashboards. */
export function formatDateLong(date: Date): string {
  return `${WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`
}
