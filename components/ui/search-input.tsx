"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/lib/hooks/use-debounce"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className,
  debounceMs = 500,
}: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value)
  const debouncedValue = useDebounce(localValue, debounceMs)

  React.useEffect(() => {
    onChange(debouncedValue)
    if (onSearch) {
      onSearch(debouncedValue)
    }
  }, [debouncedValue, onChange, onSearch])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {localValue && (
        <Button
          type="button"
          variant="ghost"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
        >
          <X className="h-4 w-4 text-gray-500" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  )
}