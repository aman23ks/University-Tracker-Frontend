"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotionTable } from '@/components/ui/NotionTable'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/ui/use-toast'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { ExternalLink, Download } from 'lucide-react'

interface UniversityDetails {
  id: string
  name: string
  url: string
  programs: string[]
  lastUpdated: string
  data: Record<string, any>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function UniversityDetailsPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [university, setUniversity] = useState<UniversityDetails | null>(null)

  useEffect(() => {
    fetchUniversityDetails()
  }, [params.id])

  const fetchUniversityDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/universities/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch university details')
      const data = await response.json()
      setUniversity(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load university details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingScreen />

  if (!university) return <div>University not found</div>

  // Create a University object for NotionTable
  const universityData = {
    id: university.id,
    name: university.name,
    url: university.url,
    programs: university.programs,
    lastUpdated: university.lastUpdated
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Breadcrumbs 
        items={[
          { label: 'Universities', href: '/dashboard/universities' },
          { label: university.name }
        ]} 
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{university.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Available Programs</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {university.programs.map((program) => (
                    <span
                      key={program}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                    >
                      {program}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(university.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
                {user?.is_premium && (
                  <Button onClick={() => {/* Export logic */}}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add relevant statistics here */}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="data" className="w-full">
        <TabsList>
          <TabsTrigger value="data">University Data</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data">
          <NotionTable
            universities={[universityData]}
            isPremium={user?.is_premium || false}
          />
        </TabsContent>
        
        <TabsContent value="programs">
          <Card>
            <CardContent className="py-6">
              {/* Programs details */}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardContent className="py-6">
              {/* Notes section */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}