// components/ui/UniversityCard.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Lock, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/providers/AuthProvider"

interface UniversityCardProps {
  university: {
    id: string
    name: string
    url: string
    programs: string[]
    lastUpdated: string
    isLocked?: boolean
  }
  onSelect?: () => void
  onRemove?: () => void
}

export default function UniversityCard({ 
  university, 
  onSelect,
  onRemove 
}: UniversityCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const isPremium = user?.is_premium || false

  const handleSelect = () => {
    if (university.isLocked && !isPremium) {
      toast({
        title: "Premium Required",
        description: "Upgrade to premium to access more universities",
        variant: "destructive"
      })
      return
    }
    onSelect?.()
  }

  return (
    <Card className="relative overflow-hidden">
      {university.isLocked && !isPremium && (
        <div className="absolute right-2 top-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{university.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground truncate">{university.url}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Programs</h4>
          <div className="flex flex-wrap gap-2">
            {university.programs.map((program) => (
              <span
                key={program}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10"
              >
                {program}
              </span>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(university.lastUpdated).toLocaleDateString()}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(university.url, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          {isPremium && onRemove && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {onSelect && (
            <Button
              size="sm"
              disabled={university.isLocked && !isPremium}
              onClick={handleSelect}
            >
              Select
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}