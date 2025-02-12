"use client"

import { useState, useEffect } from 'react'
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
import { AlertTriangle, Pencil, Save, X, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ApiResponse {
  success: boolean
  column?: {
    id: string
    name: string
    type: string
  }
  error?: string
}

export interface University {
  id: string
  url: string
  programs: string[] | string
  last_updated?: string
  created_at?: string
  metadata?: Record<string, any>
  university?: {
    id: string
    url: string
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
  id: string
  url: string
  programs: string
  last_updated?: string
  created_at?: string
  [key: string]: any
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

export function NotionTable({ 
  universities, 
  onRemoveUniversity, 
  isPremium,
  loading: initialLoading = false
}: NotionTableProps) {
  const [tableData, setTableData] = useState<TableRowData[]>([])
  const [columns, setColumns] = useState<Array<{id: string, title: string}>>([
    { id: 'url', title: 'URL' },
    { id: 'programs', title: 'Programs' },
    { id: 'last_updated', title: 'Last Updated' }
  ])
  const [newColumn, setNewColumn] = useState('')
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{rowId: string, columnId: string} | null>(null)
  const [editValue, setEditValue] = useState('')
  const { toast } = useToast()

  useEffect(() => {
  const loadData = async () => {
    if (universities.length > 0) {
      console.log('Universities changed:', universities);
      await loadAllData();
    } else {
      setTableData([]);
    }
  };

  loadData();
}, [universities]);

  const loadAllData = async () => {
  setLoading(true);
  try {
    // First initialize basic data
    const initialData: TableRowData[] = universities.map(uni => {
      // Handle both normal university object and the nested format from new additions
      const university = uni.university || uni;
      return {
        id: university.id,
        url: university.url,
        programs: Array.isArray(university.programs) ? university.programs.join(', ') : university.programs,
        last_updated: university.last_updated ? new Date(university.last_updated).toLocaleString() : 'N/A',
        created_at: university.created_at ? new Date(university.created_at).toLocaleString() : 'N/A'
      };
    });

    setTableData(initialData);

    // Then fetch columns and their data
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication token not found');

    const columnsResponse = await fetch(`${API_URL}/api/columns`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!columnsResponse.ok) throw new Error('Failed to fetch columns');
    
    const storedColumns = await columnsResponse.json();
    const customColumns = storedColumns.map((col: { id: string; name: string }) => ({
      id: col.id,
      title: col.name
    }));

    // Set columns first
    setColumns(prev => {
      const defaultColumns = prev.filter(col => 
        ['url', 'programs', 'last_updated'].includes(col.id)
      );
      return [...defaultColumns, ...customColumns];
    });

    // Then fetch column data with the correct IDs
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
    
    // Update table data with column values
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

  const addColumn = async () => {
  if (!newColumn.trim()) return;
  
  setLoading(true);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    // First create the column
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
    if (!result.success || !result.column) {
      throw new Error('Invalid response from server');
    }

    // Add the new column to columns state
    const columnId = result.column.id;
    const columnTitle = result.column.name;
    
    setColumns(prev => [...prev, { id: columnId, title: columnTitle }]);

    // For each university, get RAG response and save it
    for (const row of tableData) {
      try {
        // Query RAG for this university
        const ragResponse = await fetch(`${API_URL}/api/rag`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            question: `What is the ${newColumn.trim()} for this university program?`,
            university_id: row.id
          })
        });

        if (!ragResponse.ok) {
          throw new Error('Failed to get RAG response');
        }

        const ragResult = await ragResponse.json();
        const value = ragResult.answer || 'No information available';

        // Save the RAG response to the database
        await fetch(`${API_URL}/api/columns/data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            university_id: row.id,
            column_id: columnId,
            value: value
          })
        });

        // Update local state
        setTableData(current =>
          current.map(item =>
            item.id === row.id
              ? { ...item, [columnId]: value }
              : item
          )
        );
      } catch (err) {
        console.error(`Error processing data for ${row.url}:`, err);
      }
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
                    {column.title}
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
    </div>
  );
}