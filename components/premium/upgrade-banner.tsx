"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Check } from "lucide-react"

interface UpgradeBannerProps {
  onUpgrade: () => void
}

export function UpgradeBanner({ onUpgrade }: UpgradeBannerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const features = [
    "Unlimited university selections",
    "Export data to Excel",
    "Custom data fields",
    "Priority support",
    "Advanced analytics"
  ]

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      await onUpgrade()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden border-2 border-blue-500">
      <div className="absolute right-4 top-4">
        <Crown className="h-6 w-6 text-blue-500" />
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Upgrade to Premium</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Get access to all features and unlock your full potential
          </p>
          <ul className="space-y-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          className="w-full"
          onClick={handleUpgrade}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Upgrade for ₹20/month"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime. No questions asked.
        </p>
      </CardFooter>
    </Card>
  )
}