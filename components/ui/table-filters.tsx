"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { X, Filter, SortAsc, SortDesc } from 'lucide-react'

interface TableFiltersProps {
  columns: string[]
  onFilterChange: (filters: Record<string, any>) => void
  onSortChange: (sort: { column: string; direction: 'asc' | 'desc' } | null) => void
}

export function TableFilters({
  columns,
  onFilterChange,
  onSortChange
}: TableFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [activeSort, setActiveSort] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  } | null>(null)

  const handleFilterChange = (column: string, value: string) => {
    const newFilters = {
      ...activeFilters,
      [column]: value
    }
    if (!value) {
      delete newFilters[column]
    }
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSort = (column: string) => {
    let newSort = null

    if (activeSort?.column === column) {
      if (activeSort.direction === 'asc') {
        newSort = { column, direction: 'desc' as const }
      } else if (activeSort.direction === 'desc') {
        newSort = null
      }
    } else {
      newSort = { column, direction: 'asc' as const }
    }

    setActiveSort(newSort)
    onSortChange(newSort)
  }

  const clearFilters = () => {
    setActiveFilters({})
    setActiveSort(null)
    onFilterChange({})
    onSortChange(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <Select
            onValueChange={(value) => handleFilterChange('column', value)}
            value={Object.keys(activeFilters)[0] || ''}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter value..."
            value={Object.values(activeFilters)[0] || ''}
            onChange={(e) => 
              handleFilterChange(Object.keys(activeFilters)[0], e.target.value)
            }
            className="max-w-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {activeSort && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort(activeSort.column)}
            >
              {activeSort.direction === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
              {activeSort.column}
            </Button>
          )}

          {(Object.keys(activeFilters).length > 0 || activeSort) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {Object.keys(activeFilters).length > 0 && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([column, value]) => (
              <div
                key={column}
                className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded-md"
              >
                <span>{column}: {value}</span>
                <button
                  onClick={() => handleFilterChange(column, '')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}