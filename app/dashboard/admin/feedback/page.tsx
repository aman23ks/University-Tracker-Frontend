"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  MessageSquare, 
  AlertCircle, 
  Sparkles,
  Loader2,
  HelpCircle,
  Filter
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FeedbackItem {
  _id: string;
  type: 'bug' | 'feature' | 'question' | 'other';
  content: string;
  contact_email: string;
  user_email: string;
  status: 'new' | 'in_progress' | 'completed' | 'rejected' | 'emailed';
  created_at: string;
  updated_at: string;
  response?: string;
  responded_at?: string;
  admin_notes?: string;
}

interface FeedbackStats {
  total: number;
  by_type: {
    bug: number;
    feature: number;
    question: number;
    other: number;
  };
  by_status: {
    new: number;
    in_progress: number;
    completed: number;
    rejected: number;
    emailed: number;
  };
}

export default function AdminFeedbackPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [processingUpdate, setProcessingUpdate] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  
  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, [activeTab, filterType]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let url = `${API_URL}/api/feedback`;
      
      const queryParams = [];
      if (activeTab !== 'all') {
        queryParams.push(`status=${activeTab}`);
      }
      if (filterType !== 'all') {
        queryParams.push(`type=${filterType}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await fetch(url, {
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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/feedback/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load feedback statistics"
      });
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
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'emailed':
        return <Badge className="bg-purple-500">Emailed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleViewItem = (item: FeedbackItem) => {
    // Fetch the latest data for this feedback item to ensure we have the most recent status
    const fetchFeedbackItem = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/feedback/${item._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedback details');
        }
        
        const data = await response.json();
        setSelectedItem(data);
        setResponseText(data.response || '');
        setAdminNotes(data.admin_notes || '');
        setStatusUpdate(data.status);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load feedback details"
        });
        // Use the item from the list as fallback
        setSelectedItem(item);
        setResponseText(item.response || '');
        setAdminNotes(item.admin_notes || '');
        setStatusUpdate(item.status);
      }
    };
    
    fetchFeedbackItem();
    setDialogOpen(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // fetchFeedback now uses activeTab directly, so we don't need to call it here
    // It will be called by the useEffect
  };

  // Fix the TypeScript issue by forcing typed string literals
  const convertToValidStatus = (status: string): 'new' | 'in_progress' | 'completed' | 'rejected' | 'emailed' => {
    const validStatuses = ['new', 'in_progress', 'completed', 'rejected', 'emailed'];
    if (validStatuses.includes(status)) {
      return status as 'new' | 'in_progress' | 'completed' | 'rejected' | 'emailed';
    }
    return 'new'; // Default fallback
  };

  const handleUpdateFeedback = async () => {
    if (!selectedItem) return;
    
    setProcessingUpdate(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/feedback/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: statusUpdate,
          response: responseText,
          admin_notes: adminNotes
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update feedback');
      }
      
      // Update the feedback item in the local state
      const updatedFeedback = feedback.map(item => {
        if (item._id === selectedItem._id) {
          return {
            ...item,
            status: convertToValidStatus(statusUpdate),
            response: responseText,
            admin_notes: adminNotes,
            updated_at: new Date().toISOString(),
            responded_at: responseText !== selectedItem.response ? new Date().toISOString() : item.responded_at
          };
        }
        return item;
      });
      
      setFeedback(updatedFeedback);
      
      toast({
        title: "Success",
        description: "Feedback updated successfully"
      });
      
      setDialogOpen(false);
      
      // Refresh stats
      fetchStats();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update feedback"
      });
    } finally {
      setProcessingUpdate(false);
    }
  };

  const handleFilterTypeChange = (type: string) => {
    setFilterType(type);
    // fetchFeedback will be called by useEffect when filterType changes
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && feedback.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Feedback Management</h1>
      
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center h-24">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs uppercase text-muted-foreground">Total Feedback</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center h-24">
              <p className="text-3xl font-bold text-blue-500">{stats.by_status.new}</p>
              <p className="text-xs uppercase text-muted-foreground">New</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center h-24">
              <p className="text-3xl font-bold text-red-500">{stats.by_type.bug}</p>
              <p className="text-xs uppercase text-muted-foreground">Bugs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center h-24">
              <p className="text-3xl font-bold text-blue-500">{stats.by_type.feature}</p>
              <p className="text-xs uppercase text-muted-foreground">Features</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center h-24">
              <p className="text-3xl font-bold text-green-500">{stats.by_type.question}</p>
              <p className="text-xs uppercase text-muted-foreground">Questions</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
                              <Select 
                value={filterType} 
                onValueChange={handleFilterTypeChange}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>{filterType === 'bug' ? 'Bug Reports' : 
                           filterType === 'feature' ? 'Feature Requests' : 
                           filterType === 'question' ? 'Questions' : 
                           filterType === 'other' ? 'Other' : 'All Types'}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug Reports</SelectItem>
                  <SelectItem value="feature">Feature Requests</SelectItem>
                  <SelectItem value="question">Questions</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No feedback found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback.map((item) => (
                          <TableRow key={item._id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewItem(item)}>
                            <TableCell className="whitespace-nowrap">
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
                            <TableCell>{item.user_email}</TableCell>
                            <TableCell>{item.contact_email || 'None'}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewItem(item);
                                }}
                              >
                                View
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
          
          <TabsContent value="new" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>New Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.filter(item => item.status === 'new').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No new feedback found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback.filter(item => item.status === 'new').map((item) => (
                          <TableRow key={item._id}>
                            <TableCell className="whitespace-nowrap">
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
                            <TableCell>{item.user_email}</TableCell>
                            <TableCell>{item.contact_email || 'None'}</TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewItem(item)}
                              >
                                View
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
          
          <TabsContent value="in_progress" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>In Progress Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.filter(item => item.status === 'in_progress').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No in-progress feedback found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback.filter(item => item.status === 'in_progress').map((item) => (
                          <TableRow key={item._id}>
                            <TableCell className="whitespace-nowrap">
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
                            <TableCell>{item.user_email}</TableCell>
                            <TableCell>{item.contact_email || 'None'}</TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewItem(item)}
                              >
                                View
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
          
          <TabsContent value="completed" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.filter(item => item.status === 'completed').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No completed feedback found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback.filter(item => item.status === 'completed').map((item) => (
                          <TableRow key={item._id}>
                            <TableCell className="whitespace-nowrap">
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
                            <TableCell>{item.user_email}</TableCell>
                            <TableCell>{item.contact_email || 'None'}</TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewItem(item)}
                              >
                                View
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
      </div>
      
      {/* Feedback Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getFeedbackTypeIcon(selectedItem.type)}
                  <span>{getFeedbackTypeLabel(selectedItem.type)}</span>
                  {getStatusBadge(selectedItem.status)}
                </DialogTitle>
                <DialogDescription>
                  Submitted by {selectedItem.user_email} on {formatDate(selectedItem.created_at)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4 overflow-y-auto">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Feedback Content</h3>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{selectedItem.content}</p>
                  </div>
                </div>
                
                {selectedItem.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Contact email: {selectedItem.contact_email}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`mailto:${selectedItem.contact_email}`, '_blank')}
                    >
                      Send Email
                    </Button>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Status</h3>
                  <Select
                    value={statusUpdate}
                    onValueChange={setStatusUpdate}
                    disabled={processingUpdate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="emailed">Emailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Response to User</h3>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter a response to the user..."
                    rows={4}
                    disabled={processingUpdate}
                  />
                  <p className="text-xs text-muted-foreground">
                    This response will be visible to the user in their feedback history.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Admin Notes (Internal Only)</h3>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes (not visible to the user)..."
                    rows={3}
                    disabled={processingUpdate}
                  />
                </div>
              </div>
              
              <DialogFooter className="mt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  disabled={processingUpdate}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateFeedback}
                  disabled={processingUpdate}
                >
                  {processingUpdate ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Update Feedback
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
          {!selectedItem && (
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