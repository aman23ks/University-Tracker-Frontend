// hooks/useSocket.ts - optimized for cell-level updates
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface UniversityUpdateData {
  university_id: string;
  status: string;
  user_email?: string;
  timestamp?: string;
  column_id?: string;
  value?: string;
  columns_processed?: string[];
  [key: string]: any;
}

export interface UniversityDataUpdate {
  university_id: string;
  user_email: string;
  data: Record<string, any>;
  [key: string]: any;
}

export interface UserUpdateData {
  type: string;
  user_email: string;
  hidden_universities_processed?: number;
  columns_processed?: number;
  timestamp?: string;
  university_ids?: string[];
  [key: string]: any;
}

// Create a singleton socket instance outside the hook
let socket: Socket | null = null;
let listeners = 0;

export function useSocket(
  onStatusUpdate?: (data: UniversityUpdateData) => void, 
  onDataUpdate?: (data: UniversityDataUpdate) => void,
  onUserUpdate?: (data: UserUpdateData) => void
) {
  const [connected, setConnected] = useState(false);
  const callbackRefs = useRef({
    onStatusUpdate: onStatusUpdate || (() => {}),
    onDataUpdate: onDataUpdate || (() => {}),
    onUserUpdate: onUserUpdate || (() => {})
  });
  
  // Keep callbacks updated without recreating listeners
  useEffect(() => {
    callbackRefs.current = {
      onStatusUpdate: onStatusUpdate || (() => {}),
      onDataUpdate: onDataUpdate || (() => {}),
      onUserUpdate: onUserUpdate || (() => {})
    };
  }, [onStatusUpdate, onDataUpdate, onUserUpdate]);

  // Function to debounce non-critical updates
  const debounceRef = useRef<Record<string, NodeJS.Timeout>>({});
  const debounce = (key: string, fn: Function, delay: number) => {
    if (debounceRef.current[key]) {
      clearTimeout(debounceRef.current[key]);
    }
    debounceRef.current[key] = setTimeout(() => {
      fn();
      delete debounceRef.current[key];
    }, delay);
  };

  useEffect(() => {
    listeners++;
    const token = localStorage.getItem('token');
    if (!token) return;

    // Only create socket once - reuse for all components
    if (!socket) {
      console.log('Creating socket connection (singleton)');
      
      socket = io(process.env.NEXT_PUBLIC_API_URL || '', {
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error.message);
      });

      // Create event handlers for socket events once
      socket.on('university_update', (data: UniversityUpdateData) => {
        // Handle cell updates immediately (no debounce)
        if (data.status === 'column_processed' && data.column_id && data.value !== undefined) {
          document.dispatchEvent(new CustomEvent('socket:cell_update', { 
            detail: {
              university_id: data.university_id,
              column_id: data.column_id,
              value: data.value,
              user_email: data.user_email
            }
          }));
          return;
        }
        
        // Process critical status updates immediately
        if (['completed', 'failed', 'subscription_reactivated'].includes(data.status)) {
          document.dispatchEvent(new CustomEvent('socket:university_update', { detail: data }));
          return;
        }
        
        // Debounce less critical updates
        const key = `uni_update:${data.university_id}`;
        debounce(key, () => {
          document.dispatchEvent(new CustomEvent('socket:university_update', { detail: data }));
        }, 300);
      });

      socket.on('university_data', (data: UniversityDataUpdate) => {
        document.dispatchEvent(new CustomEvent('socket:university_data', { detail: data }));
      });

      socket.on('user_update', (data: UserUpdateData) => {
        document.dispatchEvent(new CustomEvent('socket:user_update', { detail: data }));
      });
    } else {
      console.log('Reusing existing socket connection');
      
      // If socket already exists, update connection status
      if (socket.connected) {
        setConnected(true);
      }
    }

    // Add event listeners to document for this component
    const handleUniversityUpdate = (e: Event) => {
      const data = (e as CustomEvent).detail;
      callbackRefs.current.onStatusUpdate(data);
    };

    const handleCellUpdate = (e: Event) => {
      const data = (e as CustomEvent).detail;
      // Cell updates are a special type of status update
      callbackRefs.current.onStatusUpdate({
        university_id: data.university_id,
        status: 'column_processed',
        column_id: data.column_id,
        value: data.value,
        user_email: data.user_email
      });
    };

    const handleUniversityData = (e: Event) => {
      const data = (e as CustomEvent).detail;
      callbackRefs.current.onDataUpdate(data);
    };

    const handleUserUpdate = (e: Event) => {
      const data = (e as CustomEvent).detail;
      callbackRefs.current.onUserUpdate(data);
    };

    document.addEventListener('socket:university_update', handleUniversityUpdate);
    document.addEventListener('socket:cell_update', handleCellUpdate);
    document.addEventListener('socket:university_data', handleUniversityData);
    document.addEventListener('socket:user_update', handleUserUpdate);

    // Cleanup on unmount
    return () => {
      listeners--;
      document.removeEventListener('socket:university_update', handleUniversityUpdate);
      document.removeEventListener('socket:cell_update', handleCellUpdate);
      document.removeEventListener('socket:university_data', handleUniversityData);
      document.removeEventListener('socket:user_update', handleUserUpdate);

      // Clear any pending debounced calls
      Object.keys(debounceRef.current).forEach(key => {
        clearTimeout(debounceRef.current[key]);
      });
      
      // Only close socket when all components are unmounted
      if (listeners === 0 && socket) {
        console.log('All components unmounted - disconnecting socket');
        socket.disconnect();
        socket = null;
      }
    };
  }, []); // Empty dependency array to run once

  return { connected };
}