# Mini Task Tracker

A simple task tracker demonstrating a Node.js + TypeScript + Express + MongoDB + Redis backend and a Next.js frontend.

## Structure
- `backend` - REST API
- `frontend` - Next.js UI

## Backend Setup
1. Install deps
   - `cd backend`
   - `npm install`
2. Create env file
   - Copy `backend/.env.example` to `backend/.env`
3. Start services
   - MongoDB and Redis must be running locally
4. Run API
   - `npm run dev`

### Backend Tests
- `npm run test`
- `npm run test:coverage`

## Frontend Setup
1. Install deps
   - `cd frontend`
   - `npm install`
2. Create env file
   - Copy `frontend/.env.example` to `frontend/.env`
3. Run app
   - `npm run dev`

## API Overview
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/tasks` (supports `?status=pending|completed` and `?dueDate=YYYY-MM-DD`)
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Notes
- Redis caches `GET /api/tasks` per user for 60 seconds and invalidates on create/update/delete.
- JWT is required for task endpoints.
