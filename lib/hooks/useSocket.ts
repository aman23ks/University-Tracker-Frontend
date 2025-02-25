// hooks/useSocket.ts - updated with error handling
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(onStatusUpdate: (data: any) => void, onDataUpdate: (data: any) => void) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('Initializing socket connection...');
    
    // Use HTTP polling as a fallback if WebSocket fails
    const socket = io(process.env.NEXT_PUBLIC_API_URL || '', {
      query: { token },
      transports: ['polling', 'websocket'],  // Try polling first
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully!');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection error - falling back to polling:', error);
    });

    socket.on('university_update', (data) => {
      console.log('Received university update:', data);
      onStatusUpdate(data);
    });

    socket.on('university_data', (data) => {
      console.log('Received university data update:', data);
      onDataUpdate(data);
    });

    return () => {
      console.log('Closing socket connection');
      socket.disconnect();
    };
  }, [onStatusUpdate, onDataUpdate]);
}