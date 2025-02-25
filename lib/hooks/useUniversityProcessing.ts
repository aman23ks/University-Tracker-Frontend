// hooks/useUniversityProcessing.ts
import { useState, useEffect } from 'react';

interface University {
  id: string;
  name: string;
  url: string;
}

const STORAGE_KEY = 'processingUniversities';

export function useUniversityProcessing() {
  const [processingUniversities, setProcessingUniversities] = useState<University[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error parsing stored universities:', error);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    // Load initial state from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProcessingUniversities(parsed);
        }
      } catch (error) {
        console.error('Error loading stored universities:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Persist state to localStorage whenever it changes
    if (processingUniversities.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processingUniversities));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [processingUniversities]);

  const addUniversity = (university: University) => {
    setProcessingUniversities(prev => {
      // Check if university already exists
      if (prev.some(u => u.id === university.id)) {
        return prev;
      }
      return [...prev, university];
    });
  };

  const removeUniversity = (id: string) => {
    setProcessingUniversities(prev => {
      const updated = prev.filter(u => u.id !== id);
      if (updated.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      }
      return updated;
    });
  };

  const getProcessingUniversity = (id: string) => {
    return processingUniversities.find(u => u.id === id);
  };

  return {
    processingUniversities,
    addUniversity,
    removeUniversity,
    getProcessingUniversity,
  };
}