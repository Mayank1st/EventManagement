// src/hooks/useSocket.js
import { useEffect } from 'react';
import io from 'socket.io-client';

const useSocket = (url) => {
  useEffect(() => {
    const socket = io(url);

    // Listen for event updates
    socket.on('eventUpdated', (event) => {
      console.log('Event updated:', event);
      // Handle event updates here
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [url]);

  // Emit an event update
  const updateEvent = (event) => {
    socket.emit('updateEvent', event);
  };

  return { updateEvent };
};

export default useSocket;
