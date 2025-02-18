"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/ui/use-toast"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import UniversityCard from "@/components/ui/UniversityCard"
import { Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface University {
  id: string
  url: string
  name: string
  programs: string[]
  lastUpdated: string
  isLocked?: boolean
}

export default function UniversitiesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [universities, setUniversities] = useState<University[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/universities`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch universities')
      const data = await response.json()

      // Mark universities as locked based on free tier limit
      const isPremium = user?.is_premium || false
      const markedData = data.map((uni: University, index: number) => ({
        ...uni,
        isLocked: !isPremium && index >= 3
      }))

      setUniversities(markedData)
      setError(null)

    } catch (error: any) {
      setError(error.message || 'Failed to load universities')
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load universities"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUniversity = async (university: University) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/users/universities/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          university_id: university.id
        })
      })

      if (!response.ok) throw new Error('Failed to add university')

      toast({
        title: "Success",
        description: "University added to your selection"
      })

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add university"
      })
    }
  }

  const handleRemoveUniversity = async (university: University) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/users/universities/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          university_id: university.id
        })
      })

      if (!response.ok) throw new Error('Failed to remove university')

      toast({
        title: "Success",
        description: "University removed from your selection"
      })

      // Refresh universities to update the UI
      await fetchUniversities()

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove university"
      })
    }
  }

  const filteredUniversities = universities.filter(uni => 
    uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.programs.some(program => 
      program.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Universities</h1>
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search universities or programs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUniversities.map((university) => (
            <UniversityCard
              key={university.id}
              university={university}
            //   onSelect={() => handleSelectUniversity(university)}
            //   onRemove={() => handleRemoveUniversity(university)}
            />
          ))}
          {filteredUniversities.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">
              No universities found
            </p>
          )}
        </div>
      )}
    </div>
  )
}