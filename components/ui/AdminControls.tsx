import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { AdminUrlProcessor } from './AdminUrlsProcessor'

interface FormData {
  url: string;
  name: string;
  program: string;
}

interface AdminControlsProps {
  onAddUniversity: (formData: FormData) => Promise<boolean>;
}

export function AdminControls({ onAddUniversity }: AdminControlsProps) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [program, setProgram] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('add-university')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!url.trim() || !program.trim() || !name.trim()) {
        throw new Error('Please fill in all fields')
      }

      // Validate URL format
      try {
        new URL(url)
      } catch {
        throw new Error('Please enter a valid URL')
      }

      const success = await onAddUniversity({
        url: url.trim(),
        name: name.trim(),
        program: program.trim()
      })

      if (success) {
        setUrl('')
        setName('')
        setProgram('')
      }

    } catch (error: any) {
      setError(error.message || 'Failed to add university')
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add university"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="add-university">Add University</TabsTrigger>
          <TabsTrigger value="url-processor">URL Processor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="add-university">
          <Card>
            <CardHeader>
              <CardTitle>Add University</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="University Name"
                    required
                    disabled={loading}
                    className="w-full"
                  />
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="University Root URL"
                    required
                    disabled={loading}
                    className="w-full"
                  />
                  <Input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    placeholder="Program Type (e.g., Computer Science)"
                    required
                    disabled={loading}
                    className="w-full"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add University
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="url-processor">
          <AdminUrlProcessor />
        </TabsContent>
      </Tabs>
    </div>
  )
}