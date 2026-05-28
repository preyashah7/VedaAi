# VedaAI

VedaAI is a full-stack AI assessment creator for Indian schools. It uses a Next.js frontend, an Express backend, MongoDB, Redis, BullMQ, WebSockets, and Gemini to generate realistic question papers from assignment details and reference material.

## Architecture

```text
+----------------------+        HTTP + WS       +----------------------+
|      Frontend        | <--------------------> |       Backend        |
| Next.js 14 + TS      |                        | Express + TS         |
| Tailwind + Zustand   |                        | MongoDB + Redis      |
+----------+-----------+                        | BullMQ Worker        |
           |                                    | Gemini AI + ws       |
           |                                    +----------+-----------+
           |                                               |
           |                                               | MongoDB / Redis
           v                                               v
   Assignment / Paper UI                            Persistent storage
```

## Tech Stack

- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand, react-hook-form, Zod, react-dropzone, html2canvas, jsPDF
- Backend: Express, TypeScript, Mongoose, ioredis, BullMQ, ws, @google/generative-ai, Zod, CORS, dotenv
- Infra: MongoDB, Redis, Docker Compose

## Setup

1. Start the infrastructure containers:

```bash
docker compose up -d
```

2. Install and run the backend:

```bash
cd backend
npm install
npm run dev
npm run worker
```

3. Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

The app expects the backend on `http://localhost:5000` and the frontend on `http://localhost:3000`.

## Deploying To Render + Vercel

Use Render for the backend API and worker, and Vercel for the Next.js frontend.

### Render

1. Create a new Blueprint from `render.yaml`.
2. Set these environment variables on the backend service and worker:

```bash
MONGODB_URI=your_mongodb_atlas_connection_string
REDIS_URL=your_redis_connection_string
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URLS=https://your-vercel-app.vercel.app,https://*.vercel.app,http://localhost:3000
```

3. Keep the backend service root at `backend/` and the worker service root at `backend/`.
4. After deployment, copy the backend URL, for example `https://vedaai-backend.onrender.com`.

### Vercel

1. Create a new Vercel project from the same repository.
2. Set the project root directory to `frontend`.
3. Set `NEXT_PUBLIC_API_URL` to your Render backend URL.
4. Deploy.

### Notes

- The frontend auth flow currently uses browser-local demo sessions, so no backend auth service is required to deploy the current version.
- If you later add real auth, keep the same Render/Vercel split and replace the local session helper with API calls.

## Environment Variables

### Backend (`backend/.env`)

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
FRONTEND_URL=http://localhost:3000
FRONTEND_URLS=http://localhost:3000,https://your-vercel-app.vercel.app
```

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## AI Generation Flow

1. A teacher submits an assignment through the create form.
2. The backend validates the payload with Zod, saves the assignment in MongoDB, and enqueues a BullMQ job.
3. The worker updates the assignment to `processing`, notifies subscribed WebSocket clients, and calls Gemini with the structured prompt.
4. Gemini returns JSON, which is parsed and validated again with Zod before saving.
5. The generated paper is stored in MongoDB and cached in Redis for one hour.
6. The backend marks the assignment `completed` and broadcasts a `JOB_COMPLETE` event.
7. The frontend listens over WebSocket and keeps the generation status visible until the paper is ready.

## Repository Layout

- `frontend/`: Next.js app router UI and PDF output
- `backend/`: Express API, worker, MongoDB models, Redis cache, WebSocket broadcast layer
- `docker-compose.yml`: local MongoDB and Redis

## Notes

- The worker runs as a separate process through `npm run worker` in the backend package.
- Redis is checked before MongoDB on paper reads.
- The paper output page is rendered as a printable exam sheet, not a generic dashboard card.
