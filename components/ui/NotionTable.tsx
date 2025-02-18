"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { AlertTriangle, Pencil, Save, X, Loader2, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/components/providers/AuthProvider'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface University {
  id: string
  url: string
  programs: string[] | string
  last_updated?: string
  created_at?: string
  metadata?: Record<string, any>
  name: string
  university?: {
    id: string
    url: string
    name: string
    programs: string[] | string
    last_updated?: string
    created_at?: string
    metadata?: Record<string, any>
  }
}

interface NotionTableProps {
  universities: University[]
  onRemoveUniversity?: (university: University) => void
  isPremium: boolean
  loading?: boolean
}

interface TableRowData {
  id: string;
  url: string;
  name: string;
  programs: string;
  last_updated?: string;
  created_at?: string;
  pending_columns?: PendingColumnUpdate[];
  [key: string]: any;
}

interface StoredColumnData {
  last_updated: string
  value: string
}

interface ColumnDataResponse {
  [key: string]: {
    [key: string]: StoredColumnData
  }
}

interface Column {
  id: string
  title: string
  is_global?: boolean
  created_by?: string
}

interface PendingColumnUpdate {
  columnId: string;
  columnTitle: string;
  createdAt: string;
}

export function NotionTable({ 
  universities, 
  onRemoveUniversity, 
  isPremium,
  loading: initialLoading = false
}: NotionTableProps) {
  const { user } = useAuth()
  const [tableData, setTableData] = useState<TableRowData[]>([])
  const [columns, setColumns] = useState<Column[]>([
    {id: 'name', title: 'University Name', is_global: true},
    { id: 'url', title: 'URL', is_global: true },
    { id: 'programs', title: 'Programs', is_global: true },
    { id: 'last_updated', title: 'Last Updated', is_global: true }
  ])
  const [newColumn, setNewColumn] = useState('')
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{rowId: string, columnId: string} | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingColumn, setDeletingColumn] = useState<string | null>(null)
  const [pendingUpdates, setPendingUpdates] = useState<{[key: string]: PendingColumnUpdate[]}>({});
  const { toast } = useToast()

  const shouldLimitUniversities = useCallback(() => {
    if (!user?.subscription) return false;
    
    // Check if subscription is expired
    if (user.subscription.expiry) {
      const expiryDate = new Date(user.subscription.expiry);
      const now = new Date();
      return now > expiryDate || user.subscription.status === 'expired';
    }
    
    return false;
  }, [user?.subscription]);

  useEffect(() => {
    const loadData = async () => {
      if (universities.length > 0) {
        let data = [...universities];
        
        // Limit to first 3 universities if subscription is expired
        if (shouldLimitUniversities()) {
          data = data.slice(0, 3);
        }
        
        console.log('Universities changed:', universities);
        await loadAllData();
      } else {
        setTableData([]);
      }
    };

    loadData();
  }, [universities, shouldLimitUniversities]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // First initialize basic data
      let initialData: TableRowData[] = universities.map(uni => {
        const university = uni.university || uni;
        return {
          id: university.id,
          name: university.name,
          url: university.url,
          programs: Array.isArray(university.programs) ? university.programs.join(', ') : university.programs,
          last_updated: university.last_updated ? new Date(university.last_updated).toLocaleString() : 'N/A',
          created_at: university.created_at ? new Date(university.created_at).toLocaleString() : 'N/A'
        };
      });

      const isExpired = user?.subscription?.status === 'expired';
      const visibleData = isExpired ? initialData.slice(0, 3) : initialData;
      const hiddenData = isExpired ? initialData.slice(3) : [];

      // Store hidden universities' IDs for tracking
      const hiddenIds = hiddenData.map(uni => uni.id);

      setTableData(visibleData);

      if (isPremium && !isExpired && Object.keys(pendingUpdates).length > 0) {
        await processPendingUpdates();
      }
      // setTableData(initialData);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const columnsResponse = await fetch(`${API_URL}/api/columns`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!columnsResponse.ok) throw new Error('Failed to fetch columns');
      
      const storedColumns = await columnsResponse.json();
      const customColumns = storedColumns.map((col: { id: string; name: string; is_global: boolean; created_by: string }) => ({
        id: col.id,
        title: col.name,
        is_global: col.is_global,
        created_by: col.created_by
      }));

      setColumns(prev => {
        const defaultColumns = prev.filter(col => 
          ['name', 'url', 'programs', 'last_updated'].includes(col.id)
        );
        return [...defaultColumns, ...customColumns];
      });

      const universityIds = initialData.map(row => row.id);
      const dataResponse = await fetch(`${API_URL}/api/columns/data/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          university_ids: universityIds
        })
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch column data');

      const columnData = await dataResponse.json() as ColumnDataResponse;
      
      setTableData(initialData.map(row => {
        const universityColumnData = columnData[row.id] || {};
        const updatedRow = { ...row } as TableRowData;
        
        Object.entries(universityColumnData).forEach(([columnId, data]) => {
          if (data && typeof data === 'object' && 'value' in data) {
            updatedRow[columnId] = data.value;
          }
        });
        
        return updatedRow;
      }));

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data"
      });
    } finally {
      setLoading(false);
    }
  };

  const processPendingUpdates = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      for (const universityId of Object.keys(pendingUpdates)) {
        for (const update of pendingUpdates[universityId]) {
          // Process RAG for each pending column
          const ragResponse = await fetch(`${API_URL}/api/rag`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              question: `What is the ${update.columnTitle} for this university program?`,
              university_id: universityId
            })
          });
  
          if (ragResponse.ok) {
            const ragResult = await ragResponse.json();
            await fetch(`${API_URL}/api/columns/data`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                university_id: universityId,
                column_id: update.columnId,
                value: ragResult.answer || 'No information available'
              })
            });
          }
        }
      }
      // Clear pending updates after processing
      setPendingUpdates({});
    } catch (error) {
      console.error('Error processing pending updates:', error);
    }
  };

  const addColumn = async () => {
    if (!newColumn.trim()) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
  
      const createResponse = await fetch(`${API_URL}/api/columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newColumn.trim(),
          type: 'text'
        })
      });
  
      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || 'Failed to create column');
      }
  
      const result = await createResponse.json();
      const columnId = result.column.id;
      const columnTitle = result.column.name;
  
      setColumns(prev => [...prev, { 
        id: columnId, 
        title: columnTitle,
        created_by: user?.email
      }]);
  
      // Only process visible universities if subscription is expired
      const isExpired = user?.subscription?.status === 'expired';
      const visibleUniversities = isExpired ? tableData.slice(0, 3) : tableData;
      const hiddenUniversities = isExpired ? tableData.slice(3) : [];
  
      // Process visible universities
      for (const row of visibleUniversities) {
        await processColumnForUniversity(row, columnId, columnTitle);
      }
  
      // Store pending updates for hidden universities
      if (isExpired && hiddenUniversities.length > 0) {
        const newPendingUpdates = { ...pendingUpdates };
        for (const uni of hiddenUniversities) {
          if (!newPendingUpdates[uni.id]) {
            newPendingUpdates[uni.id] = [];
          }
          newPendingUpdates[uni.id].push({
            columnId,
            columnTitle,
            createdAt: new Date().toISOString()
          });
        }
        setPendingUpdates(newPendingUpdates);
      }
  
      setNewColumn('');
      toast({
        title: "Success",
        description: "New column added successfully"
      });
  
    } catch (err: any) {
      console.error('Failed to add column:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to add new column"
      });
    } finally {
      setLoading(false);
    }
  };

  const processColumnForUniversity = async (university: TableRowData, columnId: string, columnTitle: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const ragResponse = await fetch(`${API_URL}/api/rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: `What is the ${columnTitle} for this university program?`,
          university_id: university.id
        })
      });
  
      if (ragResponse.ok) {
        const ragResult = await ragResponse.json();
        await fetch(`${API_URL}/api/columns/data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            university_id: university.id,
            column_id: columnId,
            value: ragResult.answer || 'No information available'
          })
        });
  
        setTableData(current =>
          current.map(item =>
            item.id === university.id
              ? { ...item, [columnId]: ragResult.answer || 'No information available' }
              : item
          )
        );
      }
    } catch (error) {
      console.error(`Error processing data for ${university.url}:`, error);
    }
  };

  const handleCellEdit = (rowId: string, columnId: string, value: string) => {
    setEditingCell({ rowId, columnId });
    setEditValue(value);
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/columns/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          university_id: editingCell.rowId,
          column_id: editingCell.columnId,
          value: editValue
        })
      });

      setTableData(current =>
        current.map(row =>
          row.id === editingCell.rowId
            ? { ...row, [editingCell.columnId]: editValue }
            : row
        )
      );

      toast({
        title: "Success",
        description: "Changes saved successfully"
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes"
      });
    } finally {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/columns/${columnId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete column');
      }

      setColumns(prev => prev.filter(col => col.id !== columnId));
      setTableData(prev => prev.map(row => {
        const newRow = { ...row };
        delete newRow[columnId];
        return newRow;
      }));

      toast({
        title: "Success",
        description: "Column deleted successfully"
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete column"
      });
    } finally {
      setDeletingColumn(null);
    }
  };

  const canDeleteColumn = (column: Column) => {
    if (user?.is_admin) return true;
    if (['url', 'programs', 'last_updated'].includes(column.id)) return false;
    if (column.is_global) return false;
    return column.created_by === user?.email;
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
            placeholder="Add new column"
            className="w-64"
            disabled={loading}
          />
          <Button
            onClick={addColumn}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : 'Add Column'}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.id} className="whitespace-nowrap">
                    <div className="flex items-center justify-between">
                      {column.title}
                      {canDeleteColumn(column) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingColumn(column.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead key="actions">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.id}`}>
                      {editingCell?.rowId === row.id && editingCell?.columnId === column.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8"
                          />
                          <Button size="sm" onClick={saveEdit}>
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="flex-1">{row[column.id] || ''}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCellEdit(row.id, column.id, row[column.id] || '')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  ))}
                  <TableCell key={`actions-${row.id}`}>
                      {isPremium && onRemoveUniversity && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const university = universities.find(u => u.id === row.id);
                            if (university) onRemoveUniversity(university);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
  
        {/* Delete Column Dialog */}
        <AlertDialog open={!!deletingColumn} onOpenChange={() => setDeletingColumn(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Column</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this column? This action cannot be undone
                and will remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingColumn && handleDeleteColumn(deletingColumn)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }