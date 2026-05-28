import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { WebSocketServer, type RawData, type WebSocket } from 'ws';
import assignmentsRouter from './routes/assignments';
import { connectDatabase } from './lib/db';
import { removeClientFromAllRooms, subscribeClientToAssignment } from './services/websocket';

const port = Number(process.env.PORT ?? 5000);
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/vedaai';
const frontendOrigins = (process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin: string): boolean => {
  return frontendOrigins.some((allowedOrigin) => {
    if (allowedOrigin === origin) {
      return true;
    }

    if (!allowedOrigin.includes('*')) {
      return false;
    }

    const escapedPattern = allowedOrigin
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\*/g, '.*');
    return new RegExp(`^${escapedPattern}$`).test(origin);
  });
};

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use('/api/assignments', assignmentsRouter);

app.get('/health', (_request, response) => {
  response.json({ ok: true });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

type ClientMessage = {
  type: 'SUBSCRIBE';
  assignmentId: string;
};

const handleMessage = (client: WebSocket, data: RawData): void => {
  try {
    const payload = Buffer.isBuffer(data) ? data.toString() : Array.isArray(data) ? Buffer.concat(data).toString() : Buffer.from(data).toString();
    const parsed = JSON.parse(payload) as Partial<ClientMessage>;
    if (parsed.type === 'SUBSCRIBE' && typeof parsed.assignmentId === 'string' && parsed.assignmentId.length > 0) {
      subscribeClientToAssignment(parsed.assignmentId, client);
    }
  } catch {
    client.send(JSON.stringify({ type: 'ERROR', message: 'Invalid websocket message' }));
  }
};

wss.on('connection', (client: WebSocket) => {
  client.on('message', (data: RawData) => handleMessage(client, data));
  client.on('close', () => removeClientFromAllRooms(client));
});

const start = async (): Promise<void> => {
  await connectDatabase(mongoUri);
  server.listen(port, () => {
    console.log(`VedaAI backend running on port ${port}`);
  });
};

void start();
