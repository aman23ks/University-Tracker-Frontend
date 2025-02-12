export interface University {
    id: string
    name: string
    url: string
    programs: string[]
    lastUpdated: string
    data?: Record<string, any>
  }
  
  export interface User {
    id: string
    email: string
    name?: string
    isPremium: boolean
    isAdmin: boolean
    selectedUniversities: string[]
    subscription?: {
      status: string
      expiry: string
      paymentHistory?: PaymentRecord[]
    }
    preferences?: Record<string, any>
    createdAt: string
    lastLoginAt: string
  }
  
  export interface PaymentRecord {
    id: string
    amount: number
    currency: string
    status: string
    createdAt: string
  }
  
  export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }
  
  export interface AuthResponse {
    token: string
    user: User
  }
  
  export interface UniversityFormData {
    url: string
    program: string
  }