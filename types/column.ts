export interface Column {
    id: string
    name: string
    type: string
    created_by: string
    is_global: boolean
    created_at: string
    last_updated: string
  }
  
export interface ColumnData {
    university_id: string
    column_id: string
    value: string
    last_updated: string
}
  
export interface DeleteColumnOptions {
    columnId: string
    onSuccess?: () => void
    onError?: (error: Error) => void
}