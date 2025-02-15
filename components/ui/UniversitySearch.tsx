"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/providers/AuthProvider'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface University {
  id: string
  url: string
  programs: string[]
}

interface UniversitySearchProps {
  selectedUniversities: string[]
  onSelect: (university: University) => Promise<void>
  isPremium: boolean
}

export function UniversitySearch({
  selectedUniversities,
  onSelect,
  isPremium,
}: UniversitySearchProps) {
  const [open, setOpen] = useState(false)
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [addingUniversity, setAddingUniversity] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const checkSubscriptionStatus = useCallback(() => {
    if (!user?.subscription) return true;
    
    if (user.subscription.expiry) {
      const expiryDate = new Date(user.subscription.expiry);
      const now = new Date();
      if (now > expiryDate || user.subscription.status === 'expired') {
        return selectedUniversities.length < 3;
      }
    }
    
    return isPremium || selectedUniversities.length < 3;
  }, [user?.subscription, isPremium, selectedUniversities.length]);

  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    try {
      console.log('[Frontend] Fetching universities list')
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/universities`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch universities')
      }
      
      const data = await response.json()
      console.log('[Frontend] Universities fetched:', data.length)
      setUniversities(data)
      setError(null)
    } catch (error) {
      console.error('[Frontend] Failed to fetch universities:', error)
      setError('Failed to load universities')
    } finally {
      setLoading(false)
    }
  }

  const isSelectionDisabled = !checkSubscriptionStatus()

  const filteredUniversities = universities.filter(uni => {
    const searchLower = search.toLowerCase()
    const isNotSelected = !selectedUniversities.includes(uni.url)
    return isNotSelected && uni.url.toLowerCase().includes(searchLower)
  })

  const handleSelect = async (university: University) => {
    if (addingUniversity) {
      console.log('[Frontend] Already processing a request, skipping')
      return
    }

    if (!checkSubscriptionStatus()) {
      toast({
        variant: "destructive",
        title: "Subscription Required",
        description: "Your subscription has expired. Please upgrade to add more universities."
      });
      return;
    }

    try {
      setAddingUniversity(true)
      console.log('[Frontend] Selected universities:', selectedUniversities)
      console.log('[Frontend] Attempting to add university:', university.url)
      
      if (selectedUniversities.includes(university.url)) {
        console.log('[Frontend] University already in selection')
        toast({
          variant: "destructive",
          title: "Already Selected",
          description: "This university is already in your selection."
        })
        return
      }

      await onSelect(university)
      
      toast({
        title: "Success",
        description: "University added successfully"
      })

      setOpen(false)
      setSearch('')

    } catch (error: any) {
      console.error('[Frontend] Error adding university:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add university"
      })
    } finally {
      setAddingUniversity(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isSelectionDisabled}
          >
            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {selectedUniversities.length > 0 
                  ? `${selectedUniversities.length} universities selected`
                  : 'Search universities...'}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-4" align="start">
          <div className="space-y-4">
            <Input
              placeholder="Search by URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
            {error ? (
              <p className="text-sm text-center text-red-500">
                {error}
              </p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {filteredUniversities.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-4">
                    No universities found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredUniversities.map((uni) => (
                      <Button
                        key={uni.id}
                        variant="ghost"
                        className="w-full justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleSelect(uni)}
                        disabled={addingUniversity}
                      >
                        {uni.url}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {isSelectionDisabled && user?.subscription?.status === 'expired' ? (
        <p className="mt-2 text-sm text-red-500">
          Your subscription has expired. Only the first 3 universities are accessible.
        </p>
      ) : isSelectionDisabled && (
        <p className="mt-2 text-sm text-red-500">
          Free tier limit reached. Upgrade to Premium for unlimited selections.
        </p>
      )}
    </div>
  )
}