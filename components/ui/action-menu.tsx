"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Action {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  destructive?: boolean
}

interface ActionMenuProps {
  actions: Action[]
  triggerClassName?: string
}

export function ActionMenu({ actions, triggerClassName }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`h-8 w-8 p-0 ${triggerClassName}`}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index, array) => (
          <React.Fragment key={action.label}>
            <DropdownMenuItem
              onClick={action.onClick}
              className={cn(
                action.destructive && "text-red-600",
                "flex items-center"
              )}
            >
              {action.icon && (
                <span className="mr-2 h-4 w-4">{action.icon}</span>
              )}
              {action.label}
            </DropdownMenuItem>
            {index < array.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}