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
 FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { 
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog"
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Crown, CreditCard, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const profileFormSchema = z.object({
 email: z.string().email(),
 currentPassword: z.string().min(6),
 newPassword: z.string().min(6).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
 const { user, updateUser } = useAuth()
 const { toast } = useToast()
 const [loading, setLoading] = useState(false)
 const [showCancelDialog, setShowCancelDialog] = useState(false)
 const [mounted, setMounted] = useState(false)

 const form = useForm<ProfileFormValues>({
   resolver: zodResolver(profileFormSchema),
   defaultValues: {
     email: '',
     currentPassword: '',
     newPassword: '',
   },
 })

 useEffect(() => {
   if (user) {
     form.reset({
       email: user.email,
       currentPassword: '',
       newPassword: '',
     })
   }
   setMounted(true)
 }, [user, form])

 if (!mounted) {
   return null
 }

 const onSubmit = async (data: ProfileFormValues) => {
   setLoading(true)
   try {
     const token = localStorage.getItem('token')
     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`
       },
       body: JSON.stringify(data)
     })

     if (!response.ok) {
       const error = await response.json()
       throw new Error(error.error || 'Failed to update profile')
     }

     const updatedUser = await response.json()
     updateUser(updatedUser)
     
     toast({
       title: 'Success',
       description: 'Your profile has been updated successfully.',
     })

     form.reset({
       email: updatedUser.email,
       currentPassword: '',
       newPassword: '',
     })
   } catch (error: any) {
     toast({
       variant: 'destructive',
       title: 'Error',
       description: error.message || 'Failed to update profile',
     })
   } finally {
     setLoading(false)
   }
 }

 const handleCancelSubscription = async () => {
   try {
     const token = localStorage.getItem('token')
     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/cancel`, {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${token}`
       }
     })

     if (!response.ok) {
       const error = await response.json()
       throw new Error(error.error || 'Failed to cancel subscription')
     }

     // Update user context
     if (user) {
       updateUser({
         ...user,
         subscription: {
           status: 'cancelled',
           expiry: user.subscription?.expiry || null,
           paymentHistory: user.subscription?.paymentHistory || []
         }
       })
     }

     setShowCancelDialog(false)
     toast({
       title: 'Success',
       description: 'Your subscription will be cancelled at the end of the billing period.'
     })
   } catch (error: any) {
     toast({
       variant: 'destructive',
       title: 'Error',
       description: error.message || 'Failed to cancel subscription'
     })
   }
 }

 const formatDate = (date: string | null | undefined) => {
   if (!date) return 'N/A'
   try {
     return new Date(date).toLocaleDateString('en-US', {
       year: 'numeric',
       month: 'long',
       day: 'numeric'
     })
   } catch (e) {
     return 'N/A'
   }
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
                   <FormDescription>
                     Leave blank to keep current password
                   </FormDescription>
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
           <CardTitle className="flex items-center gap-2">
             <Crown className="h-5 w-5 text-yellow-500" />
             Premium Subscription
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-sm font-medium text-muted-foreground">Status</p>
                 <p className="text-lg font-semibold">
                   {user.subscription?.status === 'cancelled' ? (
                     <span className="text-yellow-600">Cancelling</span>
                   ) : (
                     <span className="text-green-600">Active</span>
                   )}
                 </p>
               </div>
               <div>
                 <p className="text-sm font-medium text-muted-foreground">Next Billing</p>
                 <p className="text-lg font-semibold">
                   {formatDate(user.subscription?.expiry)}
                 </p>
               </div>
             </div>

             <div className="flex items-center gap-4">
               <Button 
                 variant="outline" 
                 className="flex-1"
                 onClick={() => setShowCancelDialog(true)}
                 disabled={user.subscription?.status === 'cancelled'}
               >
                 Cancel Subscription
               </Button>
               <Button className="flex-1">
                 <CreditCard className="h-4 w-4 mr-2" />
                 Update Payment
               </Button>
             </div>

             {user.subscription?.status === 'cancelled' && (
               <Alert>
                 <AlertTriangle className="h-4 w-4" />
                 <AlertDescription>
                   Your subscription will end on {formatDate(user.subscription.expiry)}
                 </AlertDescription>
               </Alert>
             )}
           </div>
         </CardContent>
       </Card>
     )}

     <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Cancel Subscription</DialogTitle>
           <DialogDescription>
             Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
           </DialogDescription>
         </DialogHeader>
         <DialogFooter>
           <Button
             variant="outline"
             onClick={() => setShowCancelDialog(false)}
           >
             Keep Subscription
           </Button>
           <Button
             variant="destructive"
             onClick={handleCancelSubscription}
           >
             Cancel Subscription
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   </div>
 )
}