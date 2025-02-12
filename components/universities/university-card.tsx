"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/date-utils"
import { Lock, ExternalLink, Edit, Trash } from "lucide-react"
import { useAuth } from "@/components/providers/AuthProvider"

interface UniversityCardProps {
  university: {
    name: string
    url: string
    programs: string[]
    lastUpdated: string
    isLocked?: boolean
  }
  onEdit?: () => void
  onDelete?: () => void
  onSelect?: () => void
}

export function UniversityCard({
  university,
  onEdit,
  onDelete,
  onSelect
}: UniversityCardProps) {
  const { user } = useAuth()
  const isPremium = user?.isPremium || false

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {university.name}
          </CardTitle>
          {university.isLocked && !isPremium && (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Available Programs</h4>
          <div className="flex flex-wrap gap-2">
            {university.programs.map((program) => (
              <span
                key={program}
                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
              >
                {program}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            Last updated: {formatDate(university.lastUpdated)}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(university.url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Visit website</span>
          </Button>
          {onSelect && (
            <Button
              variant="default"
              size="sm"
              onClick={onSelect}
              disabled={university.isLocked && !isPremium}
            >
              Select
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}