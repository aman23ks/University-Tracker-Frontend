import { fetchAPI } from '@/lib/utils/api'

export interface UserSubscription {
  status: string
  expiry: string | null;
  paymentHistory?: Array<{
    payment_id: string
    amount: number
    timestamp: string
  }>
}

export interface User {
  id: string;
  email: string;
  name?: string;
  is_premium: boolean;
  is_admin: boolean;
  selected_universities: string[];
  subscription?: UserSubscription;  // Made optional
  preferences?: Record<string, any>;
  created_at: string;
  last_login_at: string;
}

export interface UserProfile extends User {
  preferences: Record<string, any>
}

export interface UserSettings {
  emailNotifications: boolean
  exportFormat: 'xlsx' | 'csv' | 'json'
  theme: 'light' | 'dark' | 'system'
  timezone: string
}

export interface FetchAPIOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  responseType?: 'json' | 'blob' | 'text'
  query?: Record<string, any>
}

type APIResponse<T> = Promise<T>

export const userApi = {
  getProfile: (): APIResponse<UserProfile> => 
    fetchAPI('/api/users/profile'),

  updateProfile: (data: Partial<UserProfile>): APIResponse<UserProfile> => 
    fetchAPI('/api/users/profile', {
      method: 'PUT',
      body: data
    }),

  getSettings: (): APIResponse<UserSettings> => 
    fetchAPI('/api/users/settings'),

  updateSettings: (settings: Partial<UserSettings>): APIResponse<UserSettings> => 
    fetchAPI('/api/users/settings', {
      method: 'PUT',
      body: settings
    }),

  changePassword: (data: {
    currentPassword: string
    newPassword: string
  }): APIResponse<void> => 
    fetchAPI('/api/users/password', {
      method: 'PUT',
      body: data
    }),

  getActivity: (params?: {
    page?: number
    limit?: number
    type?: string
  }): APIResponse<{
    items: Array<{
      id: string
      type: string
      description: string
      timestamp: string
    }>
    total: number
  }> => 
    fetchAPI('/api/users/activity', {
      query: params
    }),

  deleteAccount: (password: string): APIResponse<void> => 
    fetchAPI('/api/users/delete', {
      method: 'DELETE',
      body: { password }
    }),

  getUniversities: (): APIResponse<string[]> => 
    fetchAPI('/api/users/universities'),

  updateUniversities: (universities: string[]): APIResponse<void> => 
    fetchAPI('/api/users/universities', {
      method: 'PUT',
      body: { universities }
    }),

  getNotificationPreferences: (): APIResponse<Record<string, boolean>> => 
    fetchAPI('/api/users/notifications/preferences'),

  updateNotificationPreferences: (preferences: Record<string, boolean>): APIResponse<void> => 
    fetchAPI('/api/users/notifications/preferences', {
      method: 'PUT',
      body: preferences
    }),

  markAllNotificationsAsRead: (): APIResponse<void> => 
    fetchAPI('/api/users/notifications/mark-all-read', {
      method: 'POST'
    }),

  exportData: (): APIResponse<Blob> => 
    fetchAPI('/api/users/export', {
      responseType: 'blob'
    })
}