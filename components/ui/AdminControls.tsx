import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

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
    </div>
  )
}