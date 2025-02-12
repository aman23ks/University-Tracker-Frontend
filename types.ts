// User types
export interface User {
    email: string
    isPremium: boolean
    isAdmin: boolean
    selectedUniversities: string[]
    subscription?: {
      status: 'free' | 'active' | 'expired'
      expiry?: string
      paymentHistory?: PaymentRecord[]
    }
  }
  
  export interface PaymentRecord {
    payment_id: string
    amount: number
    timestamp: string
  }
  
  // University types
  export interface University {
    url: string
    programs: string[]
    metadata: {
      name: string
      description?: string
      location?: string
      [key: string]: any
    }
    created_at: string
    last_updated: string
    is_processed: boolean
  }
  
  export interface UniversityData {
    university: string
    data: Record<string, string>
  }
  
  // RAG types
  export interface RAGQuery {
    university: string
    column: string
    namespace?: string
  }
  
  export interface RAGResponse {
    answer: string
    confidence: number
    source_count: number
    sources?: string[]
  }
  
  // Payment types
  export interface PaymentIntent {
    amount: number
    currency: string
    payment_capture: number
    notes?: Record<string, string>
  }
  
  export interface PaymentVerification {
    payment_id: string
    order_id: string
    signature: string
  }