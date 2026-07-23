'use client'

// hooks/use-dashboard-stats.ts
// Fetches dashboard statistics. Replace mock data with SWR + real API routes
// once the database is connected.

// Example with SWR (ready to uncomment):
// import useSWR from 'swr'
// const fetcher = (url: string) => fetch(url).then(r => r.json())
// export function useDashboardStats() {
//   const { data, error, isLoading } = useSWR('/api/dashboard/stats', fetcher)
//   return { stats: data, error, isLoading }
// }

export function useDashboardStats() {
  return {
    stats: {
      totalStudents: 248,
      activeTeachers: 18,
      monthlyRevenue: 47850,
      attendanceRate: 94.2,
    },
    isLoading: false,
  }
}
