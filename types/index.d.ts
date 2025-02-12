// Global type definitions

export interface User {
    id: string
    email: string
    name?: string
    isPremium: boolean
    isAdmin: boolean
    selectedUniversities: string[]
    subscription?: SubscriptionDetails
    preferences: UserPreferences
    createdAt: string
    lastLoginAt: string
  }
  
  export interface SubscriptionDetails {
    status: 'active' | 'cancelled' | 'expired'
    planId: string
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  }
  
  export interface UserPreferences {
    theme: 'light' | 'dark' | 'system'
    emailNotifications: boolean
    exportFormat: 'xlsx' | 'csv' | 'json'
  }
  
  export interface University {
    id: string
    name: string
    url: string
    programs: string[]
    lastUpdated: string
    metadata?: UniversityMetadata
    isLocked?: boolean
  }
  
  export interface UniversityMetadata {
    location?: string
    established?: string
    ranking?: number
    accreditation?: string[]
    [key: string]: any
  }
  
  export interface UniversityData {
    [key: string]: any
  }
  
  export interface ActivityLog {
    id: string
    userId: string
    type: ActivityType
    description: string
    metadata?: Record<string, any>
    timestamp: string
  }
  
  export type ActivityType = 
    | 'university_added'
    | 'university_removed'
    | 'data_exported'
    | 'subscription_updated'
    | 'profile_updated'
    | 'settings_updated'
  
  export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    metadata?: {
      page?: number
      totalPages?: number
      totalItems?: number
    }
  }
  
  export interface PaginationParams {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  
  export interface FilterParams {
    search?: string
    [key: string]: any
  }
  
  declare global {
    interface Window {
      Razorpay: any
    }
  }