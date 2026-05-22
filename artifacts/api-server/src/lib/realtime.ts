import http from "node:http";
import type { Express } from "express";
import WebSocket, { WebSocketServer } from "ws";

type ChatPayload = {
  streamId: string;
  message: unknown;
};

export function createRealtimeServer(server: http.Server, app: Express) {
  const wss = new WebSocketServer({ server, path: "/api/realtime" });
  const rooms = new Map<string, Set<WebSocket>>();

  function broadcastChat(streamId: string, message: unknown) {
    const payload = JSON.stringify({ type: "chat.message", streamId, message } satisfies ChatPayload & { type: string });
    rooms.get(streamId)?.forEach((socket) => {
      if (socket.readyState === socket.OPEN) socket.send(payload);
    });
  }

  wss.on("connection", (socket, req) => {
    const url = new URL(req.url ?? "", "http://localhost");
    const streamId = url.searchParams.get("streamId");
    if (!streamId) {
      socket.close(1008, "streamId required");
      return;
    }
    const room = rooms.get(streamId) ?? new Set<WebSocket>();
    room.add(socket);
    rooms.set(streamId, room);
    socket.on("close", () => {
      room.delete(socket);
      if (!room.size) rooms.delete(streamId);
    });
  });

  app.set("broadcastChat", broadcastChat);
  return wss;
}
