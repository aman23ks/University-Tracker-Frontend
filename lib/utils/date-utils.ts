export const formatDate = (date: Date | string, options: Intl.DateTimeFormatOptions = {}): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }
    return new Date(date).toLocaleDateString(undefined, defaultOptions)
  }
  
  export const formatRelativeTime = (date: Date | string): string => {
    const now = new Date()
    const then = new Date(date)
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    }
  
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit)
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`
      }
    }
  
    return 'just now'
  }
  
  export const getDateRange = (range: 'week' | 'month' | 'year'): { start: Date; end: Date } => {
    const end = new Date()
    const start = new Date()
  
    switch (range) {
      case 'week':
        start.setDate(end.getDate() - 7)
        break
      case 'month':
        start.setMonth(end.getMonth() - 1)
        break
      case 'year':
        start.setFullYear(end.getFullYear() - 1)
        break
    }
  
    return { start, end }
  }
  
  export const isValidDate = (date: any): boolean => {
    if (!date) return false
    const parsedDate = new Date(date)
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime())
  }
  
  export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
  
  export const getMonthName = (month: number): string => {
    return new Date(0, month).toLocaleString('default', { month: 'long' })
  }
  
  export const getDayName = (date: Date): string => {
    return date.toLocaleString('default', { weekday: 'long' })
  }