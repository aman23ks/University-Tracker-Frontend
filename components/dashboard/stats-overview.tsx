"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, University, Star, TrendingUp } from "lucide-react"

interface StatsOverviewProps {
  stats: {
    totalUsers: number
    activeUsers: number
    premiumUsers: number
    universities: number
    growthRate: number
  }
  loading?: boolean
}

export function StatsOverview({ stats, loading = false }: StatsOverviewProps) {
  const items = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Total registered users"
    },
    {
      title: "Premium Users",
      value: stats.premiumUsers,
      icon: Star,
      description: "Active premium subscribers"
    },
    {
      title: "Universities",
      value: stats.universities,
      icon: University,
      description: "Universities in database"
    },
    {
      title: "Growth Rate",
      value: `${stats.growthRate}%`,
      icon: TrendingUp,
      description: "Monthly growth rate"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "-" : item.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}