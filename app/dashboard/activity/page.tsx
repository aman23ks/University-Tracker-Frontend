"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/ui/use-toast'
import { formatRelativeTime } from '@/lib/utils/date-utils'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function ActivityPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchActivities()
  }, [filter])

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_URL}/api/activity?filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      if (!response.ok) throw new Error('Failed to fetch activities')
      const data = await response.json()
      setActivities(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load activity history',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'university_added':
        return '➕'
      case 'university_removed':
        return '🗑️'
      case 'data_exported':
        return '📤'
      case 'subscription_updated':
        return '💳'
      default:
        return '📋'
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Activity History</h1>
          <p className="text-muted-foreground">
            Track your recent actions and changes
          </p>
        </div>
        <Select
          value={filter}
          onValueChange={value => setFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter activities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="university">Universities</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="export">Exports</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No activities found
            </p>
          ) : (
            <div className="space-y-8">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p>{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                    {activity.metadata && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="font-medium">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}