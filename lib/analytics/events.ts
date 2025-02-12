export type AnalyticsEvent =
  | 'page_view'
  | 'user_signup'
  | 'user_login'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'university_selected'
  | 'university_removed'
  | 'data_exported'
  | 'search_performed'
  | 'filter_applied'
  | 'error'
  | 'feature_used'

export interface EventProperties {
  [key: string]: any
}

export const EVENT_NAMES = {
  // Auth Events
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Subscription Events
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',

  // University Events
  UNIVERSITY_SELECTED: 'university_selected',
  UNIVERSITY_REMOVED: 'university_removed',
  UNIVERSITY_DATA_UPDATED: 'university_data_updated',

  // Feature Usage Events
  DATA_EXPORTED: 'data_exported',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  COLUMN_ADDED: 'column_added',
  COLUMN_REMOVED: 'column_removed',

  // Error Events
  ERROR_OCCURRED: 'error',
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error',

  // UI Events
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
  BUTTON_CLICKED: 'button_clicked',
  LINK_CLICKED: 'link_clicked',
}

export const trackPageView = (page: string) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-ignore
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: page,
    })
  }
}

export const trackEvent = (
  event: AnalyticsEvent,
  properties?: EventProperties
) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-ignore
    window.gtag('event', event, properties)
  }
}