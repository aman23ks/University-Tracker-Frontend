"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean
  children: React.ReactNode
}

export function Toolbar({ className, loading, children }: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 py-4",
        loading && "opacity-50 pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  )
}

interface ToolbarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "right"
}

export function ToolbarSection({ align = "left", className, children, ...props }: ToolbarSectionProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        align === "right" && "ml-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function ToolbarButton({ active, className, children, ...props }: ToolbarButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        active && "bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function ToolbarSeparator() {
  return <div className="h-6 w-px bg-border" />
}