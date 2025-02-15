export interface User {
    id: string
    email: string
    is_premium: boolean
    is_admin: boolean
    selected_universities: string[]
    subscription?: Subscription
    preferences?: {
      theme?: 'light' | 'dark' | 'system'
      emailNotifications?: boolean
      exportFormat?: 'xlsx' | 'csv' | 'json'
    }
    created_at: string
    last_login?: string
  }
  
  export interface Subscription {
    status: 'free' | 'active' | 'cancelled' | 'expired'
    expiry: string | null
    payment_history?: Array<{
      payment_id: string
      amount: number
      timestamp: string
    }>
  }

  export interface University {
    id: string
    name: string
    url: string
    programs: string[]
    lastUpdated: string
    metadata?: {
      location?: string
      established?: string
      ranking?: number
      accreditation?: string[]
      [key: string]: any
    }
  }