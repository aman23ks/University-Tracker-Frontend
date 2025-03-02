"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { useToast } from '@/components/ui/use-toast';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  PlusCircle, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle,
  Info
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FeedbackItem {
  _id: string;
  type: 'bug' | 'feature' | 'question' | 'other';
  content: string;
  contact_email: string;
  status: 'new' | 'in_progress' | 'completed' | 'rejected' | 'emailed';
  created_at: string;
  updated_at: string;
  response?: string;
  responded_at?: string;
}

export default function FeedbackPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUserFeedback();
    }, 30000); // Refresh every 30 seconds
    
    // Initial fetch
    fetchUserFeedback();
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchUserFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/feedback`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      
      const data = await response.json();
      setFeedback(data.items);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load feedback"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case 'bug':
        return 'Bug Report';
      case 'feature':
        return 'Feature Request';
      case 'question':
        return 'Question';
      default:
        return 'Other';
    }
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="info">New</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'emailed':
        return <Badge className="bg-purple-500">Emailed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleSubmitSuccess = () => {
    setShowForm(false);
    fetchUserFeedback();
  };

  const handleViewDetails = (item: FeedbackItem) => {
    setSelectedFeedback(item);
    setShowDetailDialog(true);
  };

  if (loading && feedback.length === 0) {
    return <LoadingScreen />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Feedback & Support</h1>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          {showForm ? 'Cancel' : (
            <>
              <PlusCircle className="h-4 w-4" />
              New Feedback
            </>
          )}
        </Button>
      </div>

      {showForm ? (
        <FeedbackForm 
          onSuccess={handleSubmitSuccess} 
          onCancel={() => setShowForm(false)} 
        />
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="bugs">Bug Reports</TabsTrigger>
            <TabsTrigger value="features">Feature Requests</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Your Feedback History</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-muted-foreground">
                      You haven't submitted any feedback yet
                    </p>
                    <Button 
                      onClick={() => setShowForm(true)} 
                      className="mt-4"
                    >
                      Submit Your First Feedback
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Response</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback.map((item) => (
                          <TableRow key={item._id} className="cursor-pointer hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getFeedbackTypeIcon(item.type)}
                                <span>{getFeedbackTypeLabel(item.type)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate">
                                {item.content}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
                            <TableCell>
                              {item.response ? (
                                <div className="truncate max-w-xs">{item.response}</div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No response yet</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(item)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bugs">
            <Card>
              <CardContent className="pt-6">
                {feedback.filter(item => item.type === 'bug').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No bug reports found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Content</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Response</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback
                          .filter(item => item.type === 'bug')
                          .map((item) => (
                            <TableRow key={item._id}>
                              <TableCell className="max-w-md">
                                <div className="truncate">
                                  {item.content}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                              <TableCell>{formatDate(item.created_at)}</TableCell>
                              <TableCell>
                                {item.response ? (
                                  <div className="truncate max-w-xs">{item.response}</div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No response yet</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewDetails(item)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features">
            <Card>
              <CardContent className="pt-6">
                {feedback.filter(item => item.type === 'feature').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No feature requests found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Content</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Response</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback
                          .filter(item => item.type === 'feature')
                          .map((item) => (
                            <TableRow key={item._id}>
                              <TableCell className="max-w-md">
                                <div className="truncate">
                                  {item.content}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                              <TableCell>{formatDate(item.created_at)}</TableCell>
                              <TableCell>
                                {item.response ? (
                                  <div className="truncate max-w-xs">{item.response}</div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No response yet</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewDetails(item)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions">
            <Card>
              <CardContent className="pt-6">
                {feedback.filter(item => item.type === 'question').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No questions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Content</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Response</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback
                          .filter(item => item.type === 'question')
                          .map((item) => (
                            <TableRow key={item._id}>
                              <TableCell className="max-w-md">
                                <div className="truncate">
                                  {item.content}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                              <TableCell>{formatDate(item.created_at)}</TableCell>
                              <TableCell>
                                {item.response ? (
                                  <div className="truncate max-w-xs">{item.response}</div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No response yet</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewDetails(item)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Feedback Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getFeedbackTypeIcon(selectedFeedback.type)}
                  <span>{getFeedbackTypeLabel(selectedFeedback.type)}</span>
                  <span className="ml-auto">{getStatusBadge(selectedFeedback.status)}</span>
                </DialogTitle>
                <DialogDescription>
                  Submitted on {formatDate(selectedFeedback.created_at)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-medium mb-1">Your Feedback:</h3>
                  <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                    {selectedFeedback.content}
                  </div>
                </div>
                
                {selectedFeedback.response && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Response:</h3>
                    <div className="p-3 bg-blue-50 rounded-md whitespace-pre-wrap">
                      {selectedFeedback.response}
                    </div>
                    {selectedFeedback.responded_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Responded on {formatDate(selectedFeedback.responded_at)}
                      </p>
                    )}
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Contact Email:</h3>
                  <p>{selectedFeedback.contact_email || 'Not provided'}</p>
                </div>
              </div>
              
              <DialogFooter className="mt-2">
                <Button onClick={() => setShowDetailDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
          {!selectedFeedback && (
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
              <DialogDescription>Loading feedback information...</DialogDescription>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}