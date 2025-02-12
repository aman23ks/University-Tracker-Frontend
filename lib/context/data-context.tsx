"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode
} from "react"
import { universityApi, University, ExportFormat } from "@/lib/api/university"
import { useToast } from "@/components/ui/use-toast"

interface DataContextType {
  universities: University[]
  loading: boolean
  error: string | null
  fetchUniversities: () => Promise<void>
  addUniversity: (data: { url: string; program: string }) => Promise<void>
  updateUniversity: (id: string, data: Partial<University>) => Promise<void>
  deleteUniversity: (id: string) => Promise<void>
  exportData: (format: ExportFormat) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchUniversities = useCallback(async () => {
    setLoading(true)
    try {
      const data = await universityApi.getAll()
      setUniversities(data)
      setError(null)
    } catch (error) {
      setError("Failed to fetch universities")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load universities. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const addUniversity = async (data: { url: string; program: string }) => {
    try {
      const newUniversity = await universityApi.create(data)
      setUniversities(prev => [...prev, newUniversity])
      toast({
        title: "Success",
        description: "University added successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add university. Please try again.",
      })
      throw error
    }
  }

  const updateUniversity = async (id: string, data: Partial<University>) => {
    try {
      const updatedUniversity = await universityApi.update(id, data)
      setUniversities(prev =>
        prev.map(uni => uni.id === id ? updatedUniversity : uni)
      )
      toast({
        title: "Success",
        description: "University updated successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update university. Please try again.",
      })
      throw error
    }
  }

  const deleteUniversity = async (id: string) => {
    try {
      await universityApi.delete(id)
      setUniversities(prev => prev.filter(uni => uni.id !== id))
      toast({
        title: "Success",
        description: "University deleted successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete university. Please try again.",
      })
      throw error
    }
  }

  const exportData = async (format: ExportFormat) => {
    try {
      const response = await universityApi.export(format)
      if (!(response instanceof Blob)) {
        throw new Error('Invalid response format')
      }
      
      const url = window.URL.createObjectURL(response)
      const a = document.createElement('a')
      const extension = format === 'xlsx' ? 'xlsx' : format
      
      a.href = url
      a.download = `universities.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Success",
        description: "Data exported successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export data. Please try again.",
      })
      throw error
    }
  }

  return (
    <DataContext.Provider
      value={{
        universities,
        loading,
        error,
        fetchUniversities,
        addUniversity,
        updateUniversity,
        deleteUniversity,
        exportData
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}