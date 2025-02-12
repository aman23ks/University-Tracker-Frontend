import { fetchAPI } from '@/lib/utils/api'

export interface SubscriptionDetails {
  status: 'active' | 'cancelled' | 'expired'
  planId: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export interface PaymentDetails {
  paymentId: string
  orderId: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

export const subscriptionApi = {
  getDetails: () => 
    fetchAPI<SubscriptionDetails>('/api/subscription'),

  createOrder: () => 
    fetchAPI<{
      orderId: string
      amount: number
      currency: string
    }>('/api/subscription/create-order'),

  verifyPayment: (data: {
    paymentId: string
    orderId: string
    signature: string
  }) => 
    fetchAPI('/api/subscription/verify', {
      method: 'POST',
      body: data
    }),

  cancel: () => 
    fetchAPI('/api/subscription/cancel', {
      method: 'POST'
    }),

  reactivate: () => 
    fetchAPI('/api/subscription/reactivate', {
      method: 'POST'
    }),

  getBillingHistory: () => 
    fetchAPI<PaymentDetails[]>('/api/subscription/billing-history'),

  updatePaymentMethod: (paymentMethodId: string) => 
    fetchAPI('/api/subscription/payment-method', {
      method: 'PUT',
      body: { paymentMethodId }
    }),

  getInvoices: () => 
    fetchAPI('/api/subscription/invoices'),

  downloadInvoice: (invoiceId: string) => 
    fetchAPI(`/api/subscription/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    })
}