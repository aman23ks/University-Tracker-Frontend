"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed",
        className
      )}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {icon && <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>}
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        {action && (
          <Button
            onClick={action.onClick}
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

interface EmptySearchProps {
  query: string
  className?: string
}

export function EmptySearch({ query, className }: EmptySearchProps) {
  return (
    <div
      className={cn(
        "flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed",
        className
      )}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">
          No results found for &quot;{query}&quot;
        </p>
      </div>
    </div>
  )
}