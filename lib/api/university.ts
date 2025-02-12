import { fetchAPI } from '@/lib/utils/api'

export interface University {
  id: string
  name: string
  url: string
  programs: string[]
  lastUpdated: string
  metadata?: Record<string, any>
}

export type ExportFormat = 'xlsx' | 'csv' | 'json'

export const universityApi = {
  getAll: () => 
    fetchAPI<University[]>('/api/universities'),

  getById: (id: string) => 
    fetchAPI<University>(`/api/universities/${id}`),

  create: (data: { url: string; program: string }) => 
    fetchAPI<University>('/api/universities', {
      method: 'POST',
      body: data
    }),

  update: (id: string, data: Partial<University>) => 
    fetchAPI<University>(`/api/universities/${id}`, {
      method: 'PUT',
      body: data
    }),

  delete: (id: string) => 
    fetchAPI<void>(`/api/universities/${id}`, {
      method: 'DELETE'
    }),

  getPrograms: (id: string) => 
    fetchAPI<string[]>(`/api/universities/${id}/programs`),

  addProgram: (id: string, program: string) => 
    fetchAPI<void>(`/api/universities/${id}/programs`, {
      method: 'POST',
      body: { program }
    }),

  removeProgram: (id: string, program: string) => 
    fetchAPI<void>(`/api/universities/${id}/programs/${program}`, {
      method: 'DELETE'
    }),

  getData: (id: string) => 
    fetchAPI<Record<string, any>>(`/api/universities/${id}/data`),

  updateData: (id: string, data: Record<string, any>) => 
    fetchAPI<void>(`/api/universities/${id}/data`, {
      method: 'PUT',
      body: data
    }),

  export: (format: ExportFormat) => 
    fetchAPI<Blob>('/api/universities/export', {
      method: 'POST',
      body: { format },
      responseType: 'blob'
    }),

  search: (query: string) => 
    fetchAPI<University[]>(`/api/universities/search?q=${query}`),

  filter: (filters: Record<string, any>) => 
    fetchAPI<University[]>('/api/universities/filter', {
      method: 'POST',
      body: filters
    })
}