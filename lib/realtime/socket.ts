import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/auth/token';
import { REALTIME_EVENTS } from './events';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY_MS = 3000;

export function createSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL_WSS ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000';

  socket = io(apiUrl, {
    path: '/api/v1/notifications/socket.io',
    auth: { token },
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: RECONNECT_DELAY_MS,
    reconnectionDelayMax: 30000,
  });

  socket.on('connect', () => {
    reconnectAttempts = 0;
  });

  socket.on('disconnect', (reason) => {
    // Reconnection is handled automatically by socket.io
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}