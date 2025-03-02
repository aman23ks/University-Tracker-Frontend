"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertTriangle, Sparkles, HelpCircle, Info } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FeedbackFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FeedbackForm({ onSuccess, onCancel }: FeedbackFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>('bug');
  const [content, setContent] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'feature':
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      case 'question':
        return <HelpCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide feedback content"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          content,
          contact_email: contactEmail
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit feedback');
      }
      
      toast({
        title: "Success",
        description: "Your feedback has been submitted. Thank you!"
      });
      
      // Reset form
      setType('bug');
      setContent('');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit feedback"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Feedback</CardTitle>
        <CardDescription>
          Report a bug, request a feature, or ask a question
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Feedback Type</label>
            <Select
              value={type}
              onValueChange={setType}
              disabled={loading}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {getFeedbackTypeIcon(type)}
                  <span>{type === 'bug' ? 'Bug Report' : 
                         type === 'feature' ? 'Feature Request' : 
                         type === 'question' ? 'Question' : 'Other'}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Bug Report</span>
                  </div>
                </SelectItem>
                <SelectItem value="feature">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span>Feature Request</span>
                  </div>
                </SelectItem>
                <SelectItem value="question">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-green-500" />
                    <span>Question</span>
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    <span>Other</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Feedback
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'bug' 
                  ? "Please describe the bug and steps to reproduce it..."
                  : type === 'feature'
                    ? "Please describe the feature you'd like to see..."
                    : type === 'question'
                      ? "What question do you have for us?"
                      : "Share your thoughts with us..."
              }
              rows={5}
              disabled={loading}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Contact Email (optional)
            </label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Your email for follow-up"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              If you'd like us to follow up with you, please provide your email address
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : 'Submit Feedback'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )};