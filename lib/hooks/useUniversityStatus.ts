import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Match the NotionTable University interface
interface UniversityStatus {
  id: string;
  name: string;
  url: string;
  status?: string;
  programs?: string[] | string;
  error?: string;
}

export function useUniversityStatus() {
  const [processingUniversities, setProcessingUniversities] = useState<UniversityStatus[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || '', {
      query: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Status tracker socket connected!');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error);
    });

    socket.on('university_update', (data) => {
      console.log('Status tracker received update:', data);
      
      setProcessingUniversities(prev => {
        const existingIndex = prev.findIndex(u => u.id === data.university_id);
        
        const updatedUniversity = {
          id: data.university_id,
          name: data.name || '',
          url: data.url || '',
          status: data.status
        };
        
        // Always update the status, don't remove completed universities
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...updatedUniversity
          };
          return updated;
        }
        
        return [...prev, updatedUniversity];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const addProcessingUniversity = (university: {
    id: string;
    name: string;
    url: string;
  }) => {
    setProcessingUniversities(prev => [
      ...prev,
      {
        ...university,
        status: 'processing'
      }
    ]);
  };

  return {
    processingUniversities,
    addProcessingUniversity,
    isProcessing: (id: string) => {
      const uni = processingUniversities.find(u => u.id === id);
      return uni?.status === 'processing' || uni?.status === 'pending';
    },
    getStatus: (id: string) => processingUniversities.find(u => u.id === id)?.status
  };
}
