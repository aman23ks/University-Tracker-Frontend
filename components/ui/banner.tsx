"use client"

import { X } from "lucide-react"
import { Button } from "./button"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface BannerProps {
  title: string
  description?: string
  variant?: "default" | "success" | "warning" | "error"
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  dismissible?: boolean
}

export function Banner({
  title,
  description,
  variant = "default",
  action,
  className,
  dismissible = true,
}: BannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "relative rounded-lg px-4 py-3",
        {
          "bg-blue-50 text-blue-800": variant === "default",
          "bg-green-50 text-green-800": variant === "success",
          "bg-yellow-50 text-yellow-800": variant === "warning",
          "bg-red-50 text-red-800": variant === "error",
        },
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
          {action && (
            <Button
              variant="link"
              className="mt-2 h-auto p-0 text-sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </div>
  )
}