"use client"

import { useState, useEffect, useCallback, useRef, useReducer } from 'react'
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
import { useUniversityStatus } from '../../lib/hooks/useUniversityStatus'
import { useSocket, UniversityUpdateData, UserUpdateData } from '../../lib/hooks/useSocket'
import React from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles()} border`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
    </span>
  );
};

export interface University {
  id: string
  url: string
  programs: string[] | string
  last_updated?: string
  created_at?: string
  metadata?: Record<string, any>
  name: string,
  status: string,
  university?: {
    id: string
    url: string
    name: string,
    status: string,
    programs: string[] | string
    last_updated?: string
    created_at?: string
    metadata?: Record<string, any>
  }
  [key: string]: any; // Add index signature to allow dynamic properties
}

interface NotionTableProps {
  universities: University[]
  onRemoveUniversity?: (university: University) => void
  isPremium: boolean
  loading?: boolean
  processingUniversities?: Set<string>
  adminActions?: (university: University) => React.ReactNode
}

interface TableRowData {
  id: string;
  name: string;
  url: string;
  programs: string;
  status: string;
  last_updated?: string;
  created_at?: string;
  metadata?: Record<string, any>;
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

interface CellState {
  loading: boolean;
  value: string | null;
}

export function NotionTable({ 
  universities, 
  onRemoveUniversity, 
  isPremium,
  loading: initialLoading = false,
  processingUniversities = new Set<string>()
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
  const { isProcessing, getStatus } = useUniversityStatus();
  const { toast } = useToast()
  
  // Force update function
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  
  // Use ref to track cell states
  const cellStatesRef = useRef<Record<string, CellState>>({});
  
  // Keep track of which universities are in processing state
  const [universityStates, setUniversityStates] = useState<Record<string, string>>({});


  // Filter visible universities based on subscription status
  // const filterVisibleUniversities = useCallback((unis: University[]): University[] => {
  //   if (!user) return unis;
    
  //   const isExpired = user.subscription?.status === 'expired';
    
  //   // If subscription is expired, only show first 3 universities
  //   if (isExpired && !user.is_admin) {
  //     return unis.slice(0, 3);
  //   }
    
  //   // Otherwise show all universities
  //   return unis;
  // }, [user]);

  // Subscription: Uncomment the code above and remove the code below
  const filterVisibleUniversities = useCallback((unis: University[]): University[] => {
    // Always return all universities
    return unis;
    
    /* Original code commented out for future use
    if (!user) return unis;
    
    const isExpired = user.subscription?.status === 'expired';
    
    // If subscription is expired, only show first 3 universities
    if (isExpired && !user.is_admin) {
      return unis.slice(0, 3);
    }
    
    // Otherwise show all universities
    return unis;
    */
  }, []);

  // Initialize cell states when universities or columns change
  useEffect(() => {
    if (universities.length > 0 || columns.length > 0) {
      // Keep track of existing states
      const existingStates = { ...cellStatesRef.current };
      
      // Initialize cell states for all visible universities
      const visibleUniversities = filterVisibleUniversities(universities);
      
      visibleUniversities.forEach(uni => {
        const universityId = uni.id;
        
        // Set university status if it's being processed
        if (processingUniversities.has(universityId)) {
          setUniversityStates(prev => ({ ...prev, [universityId]: 'processing' }));
        }
        
        // Initialize cells for this university
        columns.forEach(col => {
          const cellKey = `${universityId}:${col.id}`;
          
          // Preserve existing state if available
          if (existingStates[cellKey]) {
            cellStatesRef.current[cellKey] = existingStates[cellKey];
          } else {
            // Initialize with loading state for custom columns in processing universities
            const isCustomColumn = !['name', 'url', 'programs', 'status', 'last_updated'].includes(col.id);
            const shouldBeLoading = isCustomColumn && processingUniversities.has(universityId);
            
            cellStatesRef.current[cellKey] = {
              loading: shouldBeLoading,
              value: uni[col.id] || null
            };
          }
        });
      });
      
      // IMPORTANT: Don't call forceUpdate() here as it creates an infinite loop
      // The component will render on its own after setState is called
    }
  }, [universities, columns, processingUniversities, filterVisibleUniversities]);

  useEffect(() => {
    if (processingUniversities.size > 0) {
      // This useEffect is focused only on processing universities
      // and won't cause an infinite loop
      const updatedStates = { ...cellStatesRef.current };
      let statesChanged = false;
      
      processingUniversities.forEach(universityId => {
        // Set university status to processing
        setUniversityStates(prev => ({ ...prev, [universityId]: 'processing' }));
        
        // Find custom columns
        const customColumns = columns.filter(col => 
          !['name', 'url', 'programs', 'status', 'last_updated'].includes(col.id)
        );
        
        // Set loading state for each custom column
        customColumns.forEach(col => {
          const cellKey = `${universityId}:${col.id}`;
          
          // Only update if not already set
          if (!updatedStates[cellKey] || !updatedStates[cellKey].loading) {
            updatedStates[cellKey] = {
              loading: true,
              value: updatedStates[cellKey]?.value || null
            };
            statesChanged = true;
          }
        });
      });
      
      if (statesChanged) {
        cellStatesRef.current = updatedStates;
        forceUpdate(); // Safe to call here as dependencies won't change often
      }
    }
  }, [processingUniversities, columns]);

  // Initialize table data from universities
  useEffect(() => {
    if (universities) {
      // Filter out universities based on subscription status
      const visibleUniversities = filterVisibleUniversities(universities);
      
      setTableData(visibleUniversities.map(uni => ({
        ...uni,
        // Convert programs array to string if it's an array
        programs: Array.isArray(uni.programs) ? uni.programs.join(', ') : uni.programs || '',
        status: uni.status || 'pending',
        id: uni.id || '',
        name: uni.name || '',
        url: uni.url || '',
      })));
    }
  }, [universities, filterVisibleUniversities]);

  // Set loading state for cell
  const setCellLoadingState = useCallback((universityId: string, columnId: string, isLoading: boolean) => {
    console.log(`Setting ${universityId}:${columnId} loading state to ${isLoading}`);
    
    const cellKey = `${universityId}:${columnId}`;
    
    // Get current value
    const currentValue = cellStatesRef.current[cellKey]?.value || null;
    
    // Update our ref
    cellStatesRef.current[cellKey] = {
      loading: isLoading,
      value: currentValue
    };
    
    // Force a component update
    forceUpdate();
  }, []);

  // Check if a cell is loading
  const isCellLoadingState = useCallback((universityId: string, columnId: string): boolean => {
    const cellKey = `${universityId}:${columnId}`;
    return cellStatesRef.current[cellKey]?.loading || false;
  }, []);

  // Set cell data
  const setCellData = useCallback((universityId: string, columnId: string, value: string) => {
    const cellKey = `${universityId}:${columnId}`;
    
    console.log(`Setting cell data for ${cellKey}: ${value.substring(0, 20)}...`);
    
    // Update our ref with the new value and set loading to false
    cellStatesRef.current[cellKey] = {
      loading: false,
      value: value
    };
    
    // Also update the table data for persistence
    setTableData(prev => {
      const rowIndex = prev.findIndex(row => row.id === universityId);
      if (rowIndex === -1) return prev;
      
      const newData = [...prev];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [columnId]: value
      };
      
      return newData;
    });
    
    // Force a component update
    forceUpdate();
  }, []);

  // Main data loading function
  const loadAllData = useCallback(async (visibleUniversities: University[] = []) => {
    setLoading(true);
    try {
      // If no visible universities provided, use the filtered list
      const uniList = visibleUniversities.length > 0 
        ? visibleUniversities 
        : filterVisibleUniversities(universities);
      
      // First initialize basic data
      let initialData: TableRowData[] = uniList.map(uni => {
        const university = uni.university || uni;
        return {
          id: university.id,
          name: university.name,
          url: university.url,
          status: university.status,
          programs: Array.isArray(university.programs) ? university.programs.join(', ') : university.programs,
          last_updated: university.last_updated ? new Date(university.last_updated).toLocaleString() : 'N/A',
          created_at: university.created_at ? new Date(university.created_at).toLocaleString() : 'N/A'
        };
      });

      setTableData(initialData);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      // Fetch columns
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
          ['name', 'url', 'programs', 'status', 'last_updated'].includes(col.id)
        );
        return [...defaultColumns, ...customColumns];
      });

      // Only get data for visible universities
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
      
      const newTableData = initialData.map(row => {
        const universityColumnData = columnData[row.id] || {};
        const updatedRow = { ...row } as TableRowData;
        
        Object.entries(universityColumnData).forEach(([columnId, data]) => {
          if (data && typeof data === 'object' && 'value' in data) {
            updatedRow[columnId] = data.value;
            
            // Also update cell states ref
            const cellKey = `${row.id}:${columnId}`;
            cellStatesRef.current[cellKey] = {
              loading: false,
              value: data.value
            };
          }
        });
        
        return updatedRow;
      });
      
      setTableData(newTableData);
      forceUpdate(); // Ensure UI updates

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
  }, [filterVisibleUniversities, universities, toast]);

  // Load data when universities change
  useEffect(() => {
    const loadData = async () => {
      if (universities.length > 0) {
        // Filter visible universities based on subscription status
        const visibleUniversities = filterVisibleUniversities(universities);
        
        console.log('Universities changed:', visibleUniversities.length, 'visible out of', universities.length);
        await loadAllData(visibleUniversities);
      } else {
        setTableData([]);
      }
    };
  
    loadData();
  }, [universities, filterVisibleUniversities, loadAllData]);

  // Function to add newly visible universities to the table
  const addVisibleUniversities = useCallback(async (universityIds: string[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Check which universities are not already in the table
      const existingIds = tableData.map(row => row.id);
      const newIds = universityIds.filter(id => !existingIds.includes(id));
      
      if (newIds.length === 0) return;
      
      console.log(`Adding ${newIds.length} newly visible universities to table`);
      
      // Fetch details for these universities
      const response = await fetch(`${API_URL}/api/universities/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          universities: newIds
        })
      });
      
      if (!response.ok) return;
      
      const newUniversities = await response.json();
      
      // Add these universities to the table data
      setTableData(prev => [
        ...prev,
        ...newUniversities.map((uni: any) => ({
          id: uni.id,
          name: uni.name,
          url: uni.url,
          status: uni.status || 'processing', // Mark as processing by default
          programs: Array.isArray(uni.programs) ? uni.programs.join(', ') : uni.programs || '',
          last_updated: uni.last_updated ? new Date(uni.last_updated).toLocaleString() : 'N/A'
        }))
      ]);
      
      // Update university states
      newUniversities.forEach((uni: any) => {
        setUniversityStates(prev => ({
          ...prev,
          [uni.id]: 'processing'
        }));
      });
      
      console.log('Set loading states for custom columns on newly added universities');
      
      // Get all custom column IDs
      const customColumns = columns.filter(col => 
        !['name', 'url', 'programs', 'status', 'last_updated'].includes(col.id)
      );
      
      // Set loading state for all cells in these universities
      newUniversities.forEach((uni: any) => {
        customColumns.forEach(col => {
          console.log(`Setting loading for ${uni.id}, column ${col.id}`);
          const cellKey = `${uni.id}:${col.id}`;
          
          // Set cell to loading state
          cellStatesRef.current[cellKey] = {
            loading: true,
            value: null
          };
        });
      });
      
      // Force render update
      forceUpdate();
      
    } catch (error) {
      console.error('Error adding visible universities:', error);
    }
  }, [tableData, columns]);

  // Handle column processing for a specific university
  const processColumnForUniversity = useCallback(async (university: TableRowData, columnId: string, columnTitle: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      // Set loading state for this cell
      setCellLoadingState(university.id, columnId, true);
      
      // Set university to processing state
      setUniversityStates(prev => ({
        ...prev,
        [university.id]: 'processing'
      }));
      
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
        
        // Save the data to the backend
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
  
        // Update the cell with the new value
        setCellData(university.id, columnId, ragResult.answer || 'No information available');
      }
    } catch (error) {
      console.error(`Error processing data for ${university.url}:`, error);
      // Clear loading state even on error
      setCellLoadingState(university.id, columnId, false);
    }
  }, [setCellLoadingState, setCellData]);

  // Add a new column
  const addColumn = useCallback(async () => {
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
  
      // Add the new column to the columns list
      setColumns(prev => [...prev, { 
        id: columnId, 
        title: columnTitle,
        created_by: user?.email
      }]);
  
      // Check if subscription is expired - only process visible universities
      const isExpired = user?.subscription?.status === 'expired';
      
      // Process only visible universities
      const visibleData = isExpired ? tableData.slice(0, 3) : tableData;
      
      // Set loading state for all cells in this new column
      visibleData.forEach(row => {
        // Set university to processing state
        setUniversityStates(prev => ({
          ...prev,
          [row.id]: 'processing'
        }));
        
        // Set cell to loading state
        setCellLoadingState(row.id, columnId, true);
      });
      
      // Force update to show loading indicators
      forceUpdate();
  
      // Process each visible university
      for (const row of visibleData) {
        await processColumnForUniversity(row, columnId, columnTitle);
      }
      
      // Update university states to completed
      visibleData.forEach(row => {
        setUniversityStates(prev => ({
          ...prev,
          [row.id]: 'completed'
        }));
      });
  
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
  }, [newColumn, tableData, user, setCellLoadingState, processColumnForUniversity, toast]);

  // Handle cell editing
  const handleCellEdit = useCallback((rowId: string, columnId: string, value: string) => {
    setEditingCell({ rowId, columnId });
    setEditValue(value);
  }, []);

  // Save cell edit
  const saveEdit = useCallback(async () => {
    if (!editingCell) return;

    try {
      // Set this cell to loading
      setCellLoadingState(editingCell.rowId, editingCell.columnId, true);
      
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

      // Update the cell with the new value
      setCellData(editingCell.rowId, editingCell.columnId, editValue);

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
      
      // Clear loading state on error
      setCellLoadingState(editingCell.rowId, editingCell.columnId, false);
    } finally {
      setEditingCell(null);
      setEditValue('');
    }
  }, [editingCell, editValue, setCellLoadingState, setCellData, toast]);

  // Delete a column
  const handleDeleteColumn = useCallback(async (columnId: string) => {
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

      // Remove the column and its data
      setColumns(prev => prev.filter(col => col.id !== columnId));
      setTableData(prev => prev.map(row => {
        const newRow = { ...row };
        delete newRow[columnId];
        return newRow;
      }));
      
      // Remove from cell states
      Object.keys(cellStatesRef.current).forEach(key => {
        if (key.endsWith(`:${columnId}`)) {
          delete cellStatesRef.current[key];
        }
      });
      
      // Force update
      forceUpdate();

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
  }, [toast]);

  // Check if a column can be deleted by current user
  const canDeleteColumn = useCallback((column: Column) => {
    if (user?.is_admin) return true;
    if (['name', 'url', 'programs', 'status', 'last_updated'].includes(column.id)) return false;
    if (column.is_global) return false;
    return column.created_by === user?.email;
  }, [user]);

  // Handle WebSocket updates for cell data
  const handleStatusUpdate = useCallback((data: UniversityUpdateData) => {
    // Only process updates for current user
    if (data.user_email && data.user_email !== user?.email) return;
    
    // Handle column_processed events (cell updates)
    if (data.status === 'column_processed' && data.column_id && data.university_id) {
      console.log(`Column processed: ${data.column_id} for university ${data.university_id}`);
      
      // Make sure the university exists in our table data
      const universityExists = tableData.some(row => row.id === data.university_id);
      
      if (!universityExists) {
        console.log(`University ${data.university_id} not in table yet, skipping update`);
        return;
      }
      
      // Update the cell if value is provided
      if (data.value !== undefined) {
        setCellData(data.university_id, data.column_id as string, data.value);
      }
      
      // Set university status to column_processed
      setUniversityStates(prev => ({
        ...prev,
        [data.university_id]: 'column_processed'
      }));
      
      return;
    }
    
    // Handle completed/failed status updates
    if (['completed', 'failed'].includes(data.status) && data.university_id) {
      console.log(`Status update to ${data.status} for university ${data.university_id}`);
      
      // Update university status
      setUniversityStates(prev => ({
        ...prev,
        [data.university_id]: data.status
      }));
      
      // Clear all loading states for this university
      Object.keys(cellStatesRef.current).forEach(key => {
        if (key.startsWith(`${data.university_id}:`)) {
          cellStatesRef.current[key].loading = false;
        }
      });
      
      forceUpdate();
    }
  }, [user?.email, tableData, setCellData]);

  // Handle user updates from WebSocket
  const handleUserUpdate = useCallback((data: UserUpdateData) => {
    // Only process updates for current user
    if (data.user_email !== user?.email) return;
    
    if (data.type === 'processing_started') {
      console.log('Processing started:', data);
      
      // First, add any new universities to the table
      if (data.university_ids && data.university_ids.length > 0) {
        // Add the previously hidden universities to the table
        addVisibleUniversities(data.university_ids);
      }
      
      toast({
        title: "Premium Restored",
        description: `Processing data for ${data.hidden_universities_count || 0} previously hidden ${
          (data.hidden_universities_count || 0) === 1 ? 'university' : 'universities'
        }.`,
        duration: 5000
      });
    }
    
    if (data.type === 'subscription_reactivated') {
      toast({
        title: "Processing Complete",
        description: `Successfully processed data for all universities.`,
        duration: 5000
      });
      
      // Set all university statuses to 'completed'
      if (data.university_ids) {
        data.university_ids.forEach(uniId => {
          setUniversityStates(prev => ({
            ...prev,
            [uniId]: 'completed'
          }));
        });
        
        forceUpdate();
      }
    }
  }, [user?.email, addVisibleUniversities, toast]);

  // Connect to WebSocket
  useSocket(handleStatusUpdate, () => {}, handleUserUpdate);

  // If we have an error, show an alert
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  // Check if we should show notification about hidden universities
  const isExpired = user?.subscription?.status === 'expired';
  const hasHiddenUniversities = isExpired && universities.length > 3;

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
      
      {hasHiddenUniversities && (
        <Alert className="bg-amber-50 border-amber-200 hidden"> {/*Subscription: Remove the hideen class*/}
          <AlertDescription className="text-amber-800">
            Your subscription has expired. Only showing the first 3 universities. 
            {universities.length - 3} {universities.length - 3 === 1 ? 'university is' : 'universities are'} hidden. 
            Upgrade to premium to see all your selected universities.
          </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg overflow-hidden">
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
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row) => (
            <TableRow 
              key={row.id}
              className={
                universityStates[row.id] === 'processing' || isProcessing(row.id) ? 'bg-blue-50' :
                processingUniversities.has(row.id) ? 'bg-yellow-50' :
                universityStates[row.id] === 'failed' || getStatus(row.id) === 'failed' ? 'bg-red-50' :
                'bg-white'
              }
            >
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
                      <span className="flex-1">
                        {isCellLoadingState(row.id, column.id) ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                            <span className="text-gray-400">Loading data...</span>
                          </div>
                        ) : (
                          // Show cell value from our ref or fall back to table data
                          cellStatesRef.current[`${row.id}:${column.id}`]?.value || row[column.id] || ''
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCellEdit(row.id, column.id, row[column.id] || '')}
                        disabled={isProcessing(row.id) || isCellLoadingState(row.id, column.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              ))}
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusBadge status={universityStates[row.id] || getStatus(row.id) || row.status || 'pending'} />
                  {(universityStates[row.id] === 'processing' || isProcessing(row.id) || processingUniversities.has(row.id)) && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                {isPremium && onRemoveUniversity && !isProcessing(row.id) && (
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