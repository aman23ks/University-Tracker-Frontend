"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, University, Star, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalUniversities: number
    premiumUsers: number
    activeUsers: number
    growthRate: number
  }
  loading?: boolean
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Universities",
      value: stats.totalUniversities,
      icon: University,
      description: "Universities in database",
    },
    {
      title: "Premium Users",
      value: stats.premiumUsers,
      icon: Star,
      description: "Active premium subscribers",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Users,
      description: "Users active this month",
    },
    {
      title: "Growth Rate",
      value: `${stats.growthRate}%`,
      icon: TrendingUp,
      description: "User growth this month",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "-" : card.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}