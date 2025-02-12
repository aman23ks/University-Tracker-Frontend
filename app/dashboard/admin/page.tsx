"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { AdminControls } from '@/components/ui/AdminControls'
import { NotionTable, type University } from '@/components/ui/NotionTable'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface User {
  id: string
  email: string
  is_premium: boolean
  selected_universities: string[]
  subscription?: {
    status: string
    expiry: string
  }
}

interface FormData {
  url: string
  program: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [universities, setUniversities] = useState<University[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    if (!user.is_admin) {
      router.push('/dashboard/user')
      return
    }

    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [uniRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/universities`, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }),
        fetch(`${API_URL}/api/users`, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        })
      ])

      if (!uniRes.ok) throw new Error('Failed to fetch universities')
      if (!usersRes.ok) throw new Error('Failed to fetch users')

      const [uniData, userData] = await Promise.all([
        uniRes.json(),
        usersRes.json()
      ])

      setUniversities(uniData)
      setUsers(userData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load dashboard data'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddUniversity = async (formData: FormData): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add university')
      }

      const newUni = await response.json()
      setUniversities(prev => [...prev, newUni])
      
      toast({
        title: 'Success',
        description: 'University added successfully'
      })
      
      return true
    } catch (error: any) {
      console.error('Failed to add university:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add university'
      })
      return false
    }
  }

  const handleRemoveUniversity = async (university: University) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/universities/${university.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove university')
      }

      setUniversities(prev => prev.filter(u => u.id !== university.id))
      toast({
        title: 'Success',
        description: 'University removed successfully'
      })
    } catch (error: any) {
      console.error('Failed to remove university:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to remove university'
      })
    }
  }

  const handleManageUser = async (userId: string) => {
    // Implement user management logic
    console.log('Managing user:', userId)
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!user?.is_admin) {
    return null
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="universities">
        <TabsList className="mb-4">
          <TabsTrigger value="universities">Universities</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="universities">
          <Card>
            <CardContent className="p-6">
              <AdminControls onAddUniversity={handleAddUniversity} />
              <div className="mt-6">
                <NotionTable 
                  universities={universities}
                  loading={loading}
                  isPremium={true}
                  onRemoveUniversity={handleRemoveUniversity}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" key="users-tab">
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Universities</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id || user.email}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.is_premium ? 'Premium' : 'Free'}</TableCell>
                        <TableCell>{user.selected_universities.length}</TableCell>
                        <TableCell>
                          {user.subscription?.status || 'Free'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleManageUser(user.id)}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}