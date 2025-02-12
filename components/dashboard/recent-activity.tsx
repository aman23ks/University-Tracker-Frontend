"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRelativeTime } from "@/lib/utils/date-utils"
import { Loader2 } from "lucide-react"

interface Activity {
  id: string
  type: 'add' | 'update' | 'delete' | 'export'
  description: string
  timestamp: string
  university?: string
}

interface RecentActivityProps {
  activities: Activity[]
  loading?: boolean
}

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'add':
      return '➕'
    case 'update':
      return '✏️'
    case 'delete':
      return '🗑️'
    case 'export':
      return '📤'
    default:
      return '📋'
  }
}

export function RecentActivity({ activities, loading = false }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No recent activity
          </p>
        ) : (
          <div className="space-y-8">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <div className="text-lg">{getActivityIcon(activity.type)}</div>
                  {index !== activities.length - 1 && (
                    <div className="absolute bottom-0 left-1/2 h-[calc(100%+2rem)] w-px -translate-x-1/2 translate-y-full bg-border" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    {activity.description}
                    {activity.university && (
                      <span className="font-medium"> {activity.university}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}