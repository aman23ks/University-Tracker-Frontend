"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { userApi } from '@/lib/api/user'
import type { User } from '@/lib/api/user'

const profileFormSchema = z.object({
  email: z.string().email(),
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface AuthContextValue {
  user: User | null;
  updateUser: (data: Partial<User>) => void;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth() as AuthContextValue
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true)
    try {
      const updatedUser = await userApi.updateProfile({
        email: data.email,
        ...(data.newPassword ? {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        } : {})
      })

      updateUser(updatedUser)
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      })

      form.reset({
        email: updatedUser.email,
        currentPassword: '',
        newPassword: '',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {user?.is_premium && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Status: <span className="font-medium text-green-600">
                {user.subscription?.status || 'Active'}
              </span></p>
              <p>Plan: Premium</p>
              <p>Next billing date: {user.subscription?.expiry ? 
                formatDate(user.subscription.expiry) : 'N/A'}</p>
              
              <Button variant="outline" className="mt-4">
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}