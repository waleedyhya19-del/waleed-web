'use client';

import { useEffect, useRef } from 'react';
import { createSocket, getSocket } from '@/lib/realtime/socket';
import { REALTIME_EVENTS, ReportStatusUpdatedEvent } from '@/lib/realtime/events';
import { useNotificationsStore } from '@/stores/notifications-store';
import { successToast } from '@/components/shared/error-toast';
import { useSessionStore } from '@/stores/session-store';

export function useRealtimeNotifications() {
  const user = useSessionStore((state) => state.user);
  const push = useNotificationsStore((state) => state.push);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    let socket = getSocket();
    if (!socket) {
      try {
        socket = createSocket();
      } catch {
        return;
      }
    }

    if (connectedRef.current) return;
    connectedRef.current = true;

    const handleStatusUpdate = (event: ReportStatusUpdatedEvent) => {
      const id = crypto.randomUUID();
      push({
        id,
        ...event,
        read: false,
      });
      successToast(event.actionSummary);
    };

    socket.on(REALTIME_EVENTS.REPORT_STATUS_UPDATED, handleStatusUpdate);

    return () => {
      connectedRef.current = false;
      socket?.off(REALTIME_EVENTS.REPORT_STATUS_UPDATED, handleStatusUpdate);
    };
  }, [user, push]);
}