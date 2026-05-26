import type WebSocket from 'ws';

type BroadcastMessage = Record<string, unknown>;

const roomMap = new Map<string, Set<WebSocket>>();

export const subscribeClientToAssignment = (assignmentId: string, client: WebSocket): void => {
  const room = roomMap.get(assignmentId) ?? new Set<WebSocket>();
  room.add(client);
  roomMap.set(assignmentId, room);
};

export const removeClientFromAllRooms = (client: WebSocket): void => {
  for (const [assignmentId, room] of roomMap.entries()) {
    room.delete(client);
    if (room.size === 0) {
      roomMap.delete(assignmentId);
    }
  }
};

export const broadcastToRoom = (assignmentId: string, message: BroadcastMessage): void => {
  const room = roomMap.get(assignmentId);
  if (!room) {
    return;
  }

  const payload = JSON.stringify(message);
  for (const client of room) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
};
