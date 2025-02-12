import { useState, useCallback, useMemo } from 'react'

type SortDirection = 'asc' | 'desc'

interface SortOptions<T> {
  key: keyof T
  direction: SortDirection
}

export function useSort<T>(initialData: T[], initialOptions?: SortOptions<T>) {
  const [sortOptions, setSortOptions] = useState<SortOptions<T> | undefined>(
    initialOptions
  )

  const sortData = useCallback(
    (data: T[], options?: SortOptions<T>) => {
      if (!options) return data

      return [...data].sort((a, b) => {
        const aValue = a[options.key]
        const bValue = b[options.key]

        if (aValue === bValue) return 0

        if (options.direction === 'asc') {
          return aValue < bValue ? -1 : 1
        } else {
          return aValue > bValue ? -1 : 1
        }
      })
    },
    []
  )

  const sortedData = useMemo(
    () => sortData(initialData, sortOptions),
    [initialData, sortOptions, sortData]
  )

  const sort = useCallback((key: keyof T) => {
    setSortOptions((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return undefined
    })
  }, [])

  return {
    sortedData,
    sort,
    sortOptions,
  }
}