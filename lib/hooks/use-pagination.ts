import { useState, useMemo } from 'react'

interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  pageSizes?: number[]
}

export function usePagination<T>(
  data: T[],
  {
    initialPage = 1,
    initialPageSize = 10,
    pageSizes = [10, 25, 50, 100]
  }: PaginationOptions = {}
) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Ensure current page is within valid range when data length changes
  if (currentPage > totalPages) {
    setCurrentPage(totalPages || 1)
  }

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, currentPage, pageSize])

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const changePageSize = (newSize: number) => {
    // Calculate new current page to maintain approximately the same starting position
    const firstItemIndex = (currentPage - 1) * pageSize
    const newCurrentPage = Math.floor(firstItemIndex / newSize) + 1
    
    setPageSize(newSize)
    setCurrentPage(newCurrentPage)
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData,
    pageSizes,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    startIndex: (currentPage - 1) * pageSize + 1,
    endIndex: Math.min(currentPage * pageSize, totalItems)
  }
}