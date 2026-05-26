'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

const getSocketUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
  return apiUrl.startsWith('https://')
    ? apiUrl.replace('https://', 'wss://')
    : apiUrl.replace('http://', 'ws://');
};

export const useWebSocket = (assignmentId: string | null): void => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<number | null>(null);
  const setJobStatus = useAppStore((state) => state.setJobStatus);
  const setCurrentAssignmentId = useAppStore((state) => state.setCurrentAssignmentId);
  const setCurrentJobId = useAppStore((state) => state.setCurrentJobId);

  useEffect(() => {
    if (!assignmentId) {
      return undefined;
    }

    const clearReconnectTimer = (): void => {
      if (reconnectTimer.current !== null) {
        window.clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    const connect = (): void => {
      const socket = new WebSocket(getSocketUrl());
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttempts.current = 0;
        socket.send(JSON.stringify({ type: 'SUBSCRIBE', assignmentId }));
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data as string) as {
          type: string;
          assignmentId?: string;
          paperId?: string;
          error?: string;
          jobId?: string;
        };

        if (message.assignmentId) {
          setCurrentAssignmentId(message.assignmentId);
        }

        switch (message.type) {
          case 'JOB_STARTED':
            setJobStatus('processing');
            break;
          case 'JOB_COMPLETE':
            if (message.assignmentId) {
              setCurrentAssignmentId(message.assignmentId);
            }
            setJobStatus('completed');
            if (message.jobId) {
              setCurrentJobId(message.jobId);
            }
            break;
          case 'JOB_FAILED':
            setJobStatus('failed');
            break;
          default:
            break;
        }
      };

      socket.onerror = () => {
        setJobStatus('failed');
      };

      socket.onclose = () => {
        if (reconnectAttempts.current < 3) {
          reconnectAttempts.current += 1;
          reconnectTimer.current = window.setTimeout(connect, 1000 * reconnectAttempts.current);
        }
      };
    };

    connect();

    return () => {
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [assignmentId, setCurrentAssignmentId, setCurrentJobId, setJobStatus]);
};
