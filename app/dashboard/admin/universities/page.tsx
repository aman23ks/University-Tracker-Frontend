"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface University {
  id: string;
  name: string;
  url: string;
  programs: string[];
  lastUpdated: string;
  metadata?: Record<string, any>;
}

export default function AdminUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    url: '',
    program: ''
  });
  const [processingAdd, setProcessingAdd] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/universities`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch universities');
      const data = await response.json();
      setUniversities(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load universities"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUniversity = async () => {
    if (!newUniversity.name || !newUniversity.url || !newUniversity.program) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields"
      });
      return;
    }

    try {
      setProcessingAdd(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUniversity)
      });

      if (!response.ok) throw new Error('Failed to add university');

      toast({
        title: "Success",
        description: "University added successfully"
      });

      setAddDialogOpen(false);
      setNewUniversity({ name: '', url: '', program: '' });
      fetchUniversities();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add university"
      });
    } finally {
      setProcessingAdd(false);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/universities/export`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format: 'xlsx' })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'universities.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Data exported successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export data"
      });
    }
  };

  const filteredUniversities = universities.filter(uni => 
    uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Universities</h1>
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={handleExportData}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add University
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search universities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Programs</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUniversities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No universities found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUniversities.map((uni) => (
                    <TableRow key={uni.id}>
                      <TableCell>{uni.name}</TableCell>
                      <TableCell>
                        <a 
                          href={uni.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {uni.url}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {uni.programs.map((program) => (
                            <span
                              key={program}
                              className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                            >
                              {program}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(uni.lastUpdated).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add University</DialogTitle>
            <DialogDescription>
              Add a new university to start tracking its program data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">University Name</label>
              <Input
                value={newUniversity.name}
                onChange={(e) => setNewUniversity(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter university name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL</label>
              <Input
                value={newUniversity.url}
                onChange={(e) => setNewUniversity(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Enter university website URL"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Program</label>
              <Input
                value={newUniversity.program}
                onChange={(e) => setNewUniversity(prev => ({ ...prev, program: e.target.value }))}
                placeholder="Enter program name (e.g., Computer Science)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={processingAdd}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddUniversity}
              disabled={processingAdd}
            >
              {processingAdd ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Add University'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}