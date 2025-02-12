"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { NotionTable, type University } from '@/components/ui/NotionTable'
import { UniversitySearch } from '@/components/ui/UniversitySearch'
import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function UserDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedUniversities, setSelectedUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUniversityDetails()
    }
    setLoading(false)
  }, [user])

  const fetchUniversityDetails = async () => {
    if (!user?.selected_universities?.length) {
      setSelectedUniversities([])
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/universities/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          universities: user.selected_universities
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch university details')
      }

      const universities: University[] = await response.json()
      setSelectedUniversities(universities)
      setShowUpgrade(!user.is_premium && universities.length >= 2)
      setError(null)

    } catch (error: any) {
      console.error('Failed to fetch university details:', error)
      setError(error.message || 'Failed to load university details')
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load university details'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (university: University) => {
    try {
      console.log('[Dashboard] Adding university:', university.url)
      const token = localStorage.getItem('token')
      
      // Add to user's selection
      const addResponse = await fetch(`${API_URL}/api/users/universities/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          university_id: university.id
        })
      })

      const responseData = await addResponse.json()
      console.log('[Dashboard] Add response:', responseData)

      if (!addResponse.ok) {
        throw new Error(responseData.error || 'Failed to add university')
      }

      // Update the universities list with the new data including column data
      setSelectedUniversities(prev => [...prev, {
        ...university,
        ...responseData.columnData
      }])

      // Update user context if needed
      if (user?.selected_universities) {
        user.selected_universities = [...user.selected_universities, university.url]
      }

    } catch (error: any) {
      console.error('[Dashboard] Error adding university:', error)
      throw error // Propagate error to UniversitySearch component
    }
  }

  const handleRemove = async (university: University) => {
    if (!user?.is_premium) return

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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove university')
      }

      setSelectedUniversities(prev => prev.filter(u => u.id !== university.id))
      
      // Update user context
      if (user?.selected_universities) {
        user.selected_universities = user.selected_universities.filter(url => url !== university.url)
      }
      
      toast({
        title: "Success",
        description: "University removed successfully"
      })
    } catch (error: any) {
      console.error('Failed to remove university:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove university"
      })
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Your Universities</h2>
        <Card>
          <CardContent className="p-6">
            <UniversitySearch
              selectedUniversities={selectedUniversities.map(u => u.url)}
              onSelect={handleSelect}
              isPremium={user?.is_premium || false}
            />
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <NotionTable
        universities={selectedUniversities}
        isPremium={user?.is_premium || false}
        onRemoveUniversity={handleRemove}
      />

      {showUpgrade && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">
            Upgrade to Premium
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            Get unlimited university selections and advanced features.
          </AlertDescription>
          <Button
            variant="default"
            className="mt-3"
            onClick={() => {
              // Implement upgrade flow
            }}
          >
            Upgrade for ₹20/month
          </Button>
        </Alert>
      )}
    </div>
  )
}