import { AnalyticsEvent, EventProperties } from './events'

class Analytics {
  private static instance: Analytics
  private initialized: boolean = false

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  init() {
    if (this.initialized) return
    // Initialize analytics service (e.g., Google Analytics, Mixpanel)
    this.initialized = true
  }

  trackEvent(event: AnalyticsEvent, properties?: EventProperties) {
    if (!this.initialized) {
      console.warn('Analytics not initialized')
      return
    }

    // Track the event
    console.log(`[Analytics] ${event}:`, properties)

    // Here you would implement actual analytics tracking
    // Example with Google Analytics:
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // @ts-ignore
      window.gtag('event', event, properties)
    }
  }

  trackPageView(page: string) {
    this.trackEvent('page_view', { page })
  }

  trackError(error: Error, context?: string) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context
    })
  }

  identifyUser(userId: string, traits?: Record<string, any>) {
    if (!this.initialized) return

    // Identify user in analytics service
    console.log(`[Analytics] Identify user:`, { userId, traits })
  }
}

export const analytics = Analytics.getInstance()