// lib/hooks/useCellLoading.ts

import { useState, useCallback } from 'react';

// Define the type for the loading cells state
interface LoadingCellsState {
  [key: string]: boolean;
}

/**
 * Custom hook to manage loading states for individual cells in the table
 * @returns {Object} Functions and state for managing cell loading
 */
export const useCellLoading = () => {
  // State to track loading cells with a structure of { "universityId:columnId": true/false }
  const [loadingCells, setLoadingCells] = useState<LoadingCellsState>({});
  
  /**
   * Set a cell to loading state
   * @param {string} universityId - ID of the university
   * @param {string} columnId - ID of the column
   */
  const setLoading = useCallback((universityId: string, columnId: string) => {
    const cellKey = `${universityId}:${columnId}`;
    setLoadingCells(prev => ({ ...prev, [cellKey]: true }));
  }, []);
  
  /**
   * Set loading state for multiple cells of the same university
   * @param {string} universityId - ID of the university
   * @param {string[]} columnIds - Array of column IDs
   */
  const setUniversityLoading = useCallback((universityId: string, columnIds: string[]) => {
    setLoadingCells(prev => {
      const newState = { ...prev };
      columnIds.forEach(columnId => {
        newState[`${universityId}:${columnId}`] = true;
      });
      return newState;
    });
  }, []);
  
  /**
   * Mark a cell as done loading
   * @param {string} universityId - ID of the university
   * @param {string} columnId - ID of the column
   */
  const clearCellLoading = useCallback((universityId: string, columnId: string) => {
    const cellKey = `${universityId}:${columnId}`;
    
    setLoadingCells(prev => {
      // If cell is not in loading state, don't update
      if (!prev[cellKey]) return prev;
      
      // Create a new object without this key
      const newState = { ...prev };
      delete newState[cellKey];
      return newState;
    });
  }, []);
  
  /**
   * Mark all cells for a university as done loading
   * @param {string} universityId - ID of the university
   */
  const clearUniversityLoading = useCallback((universityId: string) => {
    setLoadingCells(prev => {
      const newState = { ...prev };
      // Remove all keys that start with universityId:
      Object.keys(newState).forEach(key => {
        if (key.startsWith(`${universityId}:`)) {
          delete newState[key];
        }
      });
      return newState;
    });
  }, []);
  
  /**
   * Check if a cell is in loading state
   * @param {string} universityId - ID of the university
   * @param {string} columnId - ID of the column
   * @returns {boolean} Whether the cell is loading
   */
  const isCellLoading = useCallback((universityId: string, columnId: string): boolean => {
    const cellKey = `${universityId}:${columnId}`;
    return !!loadingCells[cellKey];
  }, [loadingCells]);
  
  /**
   * Reset all loading states
   */
  const resetLoading = useCallback(() => {
    setLoadingCells({});
  }, []);
  
  return {
    loadingCells,
    setLoading,
    setUniversityLoading,
    clearCellLoading,
    clearUniversityLoading,
    isCellLoading,
    resetLoading
  };
};