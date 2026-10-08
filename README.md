# UIForge

UIForge is an AI-based Screenshot-to-UI Generation System. The backend currently supports project records, screenshot uploads, and local screenshot analysis through Ollama. Frontend workflow UI, code generation, live preview, and authentication are not implemented yet.

## Structure

`client/` contains the React + Vite + Tailwind CSS frontend, `server/` contains the Express + Mongoose backend, and `docs/` holds project documentation.

## Prerequisites

- Node.js 20 or later
- MongoDB, if you want database connectivity enabled
- [Ollama](https://ollama.com) running locally with the `qwen3-vl:4b` model, if you want screenshot analysis

## Setup

Copy `client/.env.example` to `client/.env` and `server/.env.example` to `server/.env`, update values as needed, then run `npm install`. You can also run `npm install` separately inside `client` and `server`.

## Run the application

Start the frontend with `npm run dev:client` and the backend in a separate terminal with `npm run dev:server`. The health endpoint is `http://localhost:5000/api/health`.

## MongoDB configuration

Set `MONGODB_URI` in `server/.env`. When present, the server connects through Mongoose at startup. If it is omitted, the server remains available and the health endpoint reports that the database is not configured. The frontend reads only `VITE_`-prefixed variables from `client/.env`, so backend secrets and AI settings are never exposed to browser code.

## Local screenshot analysis

Analysis uses the locally running Ollama server (`OLLAMA_BASE_URL`, default `http://localhost:11434`) and `OLLAMA_MODEL` (default `qwen3-vl:4b`). Upload a screenshot with `POST /api/generations`, then start analysis with `POST /api/generations/:id/analyze`. See `docs/README.md` for the status lifecycle and UI specification shape.
