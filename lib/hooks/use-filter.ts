import { useState, useCallback, useMemo } from 'react'

interface FilterOptions<T> {
  initialFilters?: Partial<Record<keyof T, any>>
  searchFields?: Array<keyof T>
}

export function useFilter<T extends Record<string, any>>(
  data: T[],
  options: FilterOptions<T> = {}
) {
  const [filters, setFilters] = useState<Partial<Record<keyof T, any>>>(
    options.initialFilters || {}
  )
  const [searchQuery, setSearchQuery] = useState("")

  const updateFilter = useCallback(
    (key: keyof T, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchQuery("")
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Check if item matches all filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === "") return true
        return item[key] === value
      })

      // If no search query, return filter results
      if (!searchQuery) return matchesFilters

      // Check if item matches search query in any of the searchable fields
      const matchesSearch = options.searchFields
        ? options.searchFields.some((field) => {
            const fieldValue = item[field]
            if (typeof fieldValue !== "string") return false
            return fieldValue.toLowerCase().includes(searchQuery.toLowerCase())
          })
        : Object.values(item).some((value) => {
            if (typeof value !== "string") return false
            return value.toLowerCase().includes(searchQuery.toLowerCase())
          })

      return matchesFilters && matchesSearch
    })
  }, [data, filters, searchQuery, options.searchFields])

  return {
    filters,
    searchQuery,
    filteredData,
    updateFilter,
    setSearchQuery,
    clearFilters,
  }
}