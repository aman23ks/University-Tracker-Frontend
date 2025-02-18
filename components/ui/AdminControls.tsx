import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AdminControlsProps {
  onAddUniversity: (data: { url: string; name: string; program: string }) => Promise<boolean>
}

export function AdminControls({ onAddUniversity }: AdminControlsProps) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [program, setProgram] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      // Validate input
      if (!url.trim() || !program.trim() || !name.trim()) {
        throw new Error('Please fill in all fields')
      }

      // Validate URL format
      try {
        new URL(url)
      } catch {
        throw new Error('Please enter a valid URL')
      }

      const result = await onAddUniversity({ 
        url: url.trim(), 
        name: name.trim(),
        program: program.trim() 
      })
      
      if (result) {
        setSuccess(true)
        setUrl('')
        setName('')
        setProgram('')
      } else {
        throw new Error('Failed to add university')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to add university')
    } finally {
      setLoading(false)
    }
  }

  return (
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

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>University added successfully</AlertDescription>
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
  )
}