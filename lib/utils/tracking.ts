import { analytics } from '@/lib/analytics'

export interface UserActivity {
  userId: string
  action: string
  details?: Record<string, any>
  timestamp: Date
}

class ActivityTracker {
  private activities: UserActivity[] = []
  private batchSize: number = 10
  private flushInterval: number = 5000 // 5 seconds

  constructor() {
    if (typeof window !== 'undefined') {
      setInterval(() => this.flush(), this.flushInterval)
    }
  }

  track(userId: string, action: string, details?: Record<string, any>) {
    const activity: UserActivity = {
      userId,
      action,
      details,
      timestamp: new Date()
    }

    this.activities.push(activity)
    analytics.trackEvent(action as any, details)

    if (this.activities.length >= this.batchSize) {
      this.flush()
    }
  }

  private async flush() {
    if (this.activities.length === 0) return

    const activitiesToSend = [...this.activities]
    this.activities = []

    try {
      const token = localStorage.getItem('token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activity/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(activitiesToSend)
      })
    } catch (error) {
      console.error('Failed to send activities:', error)
      // Add activities back to the queue
      this.activities = [...activitiesToSend, ...this.activities]
    }
  }
}

export const activityTracker = new ActivityTracker()

export function trackUserAction(action: string, details?: Record<string, any>) {
  const userId = localStorage.getItem('userId')
  if (!userId) return

  activityTracker.track(userId, action, details)
}

export function trackError(error: Error, context?: string) {
  analytics.trackError(error, context)
}

export function trackPageView(page: string) {
  analytics.trackPageView(page)
}

export function trackFeatureUsage(feature: string, properties?: Record<string, any>) {
  analytics.trackEvent('feature_used', { feature, ...properties })
}

export function startUserSession(userId: string) {
  analytics.identifyUser(userId)
  trackUserAction('session_start')
}

export function endUserSession() {
  trackUserAction('session_end')
}