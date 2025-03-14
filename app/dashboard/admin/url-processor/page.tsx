"use client"

import { useState, useEffect } from 'react'
import { Upload, Trash, RefreshCw, Database, Info } from 'lucide-react'
import { Separator } from '@/components/ui/seperator'
import { AdminUrlProcessor } from '@/components/ui/AdminUrlsProcessor'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'

// Create a custom Heading component if you don't have one
const Heading = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
  <div className="flex items-center justify-between">
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
  </div>
)

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Define the namespace interface
interface Namespace {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  last_updated: string;
  stats?: {
    vector_count: number;
  };
}

export default function URLProcessorPage() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingNamespace, setDeletingNamespace] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchNamespaces()
  }, [])

  const fetchNamespaces = async () => {
    try {
      setLoading(true)
      setErrorMessage(null)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication token not found')

      try {
        const response = await fetch(`${API_URL}/api/admin/namespaces`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) {
        //   console.error(`Error fetching namespaces: ${response.status}`)
          setErrorMessage("Unable to load namespaces. The feature may not be fully set up yet.")
          setNamespaces([])
          return
        }

        const data = await response.json()
        setNamespaces(data)
      } catch (error) {
        console.error('Network error:', error)
        setErrorMessage("Network error when loading namespaces. Backend feature may not be available yet.")
        setNamespaces([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNamespace = async () => {
    if (!deletingNamespace) return

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication token not found')

      try {
        const response = await fetch(`${API_URL}/api/admin/namespaces/${deletingNamespace}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) {
          console.error(`Error deleting namespace: ${response.status}`)
          toast({
            variant: "default",
            title: "Partial Success",
            description: "Deleted from local state. Server operation may have failed."
          })
          
          // Remove from local state anyway
          setNamespaces(prev => prev.filter(n => n.id !== deletingNamespace))
          return
        }

        toast({
          title: "Success",
          description: "Namespace deleted successfully"
        })

        // Refresh namespaces
        fetchNamespaces()
      } catch (error) {
        console.error('Network error:', error)
        toast({
          variant: "default",
          title: "Partial Success",
          description: "Deleted from local state. Network error occurred."
        })
        
        // Remove from local state anyway
        setNamespaces(prev => prev.filter(n => n.id !== deletingNamespace))
      }
    } finally {
      setDeletingNamespace(null)
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  return (
    <>
      <div className="space-y-6 p-6">
        <Heading
          title="URL Processor"
          description="Process specific URLs and organize them in namespaces"
          icon={Upload}
        />
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <AdminUrlProcessor />
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Namespaces</CardTitle>
                  <CardDescription>Manage your data namespaces</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRefreshing(true)
                    fetchNamespaces().finally(() => setRefreshing(false))
                  }}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <Alert className="mb-4 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 mr-2 text-blue-600" />
                  <AlertDescription className="text-blue-800">{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Data Count</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {namespaces.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                            {errorMessage ? "Backend feature not available" : "No namespaces found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        namespaces.map((namespace) => (
                          <TableRow key={namespace.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                                <div>
                                  <div>{namespace.name}</div>
                                  {namespace.description && (
                                    <div className="text-xs text-muted-foreground">{namespace.description}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{namespace.stats?.vector_count || 0} vectors</TableCell>
                            <TableCell>{formatDate(namespace.last_updated)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingNamespace(namespace.id)}
                                className="text-red-500 hover:text-red-700"
                                disabled={namespace.name?.startsWith('uni_')} // Prevent deleting university namespaces
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!deletingNamespace} onOpenChange={() => setDeletingNamespace(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Namespace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this namespace? This will permanently remove all data stored in this namespace.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteNamespace}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}