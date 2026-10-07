# UIForge

UIForge is an AI-based Screenshot-to-UI Generation System. This repository currently contains only the Milestone 01 project foundation; AI generation, screenshot uploads, and authentication are intentionally out of scope.

## Structure

`client/` contains the React + Vite + Tailwind CSS frontend, `server/` contains the Express + Mongoose backend, and `docs/` holds project documentation.

## Prerequisites

- Node.js 20 or later
- MongoDB, if you want database connectivity enabled

## Setup

Copy `client/.env.example` to `client/.env` and `server/.env.example` to `server/.env`, update values as needed, then run `npm install`. You can also run `npm install` separately inside `client` and `server`.

## Run the application

Start the frontend with `npm run dev:client` and the backend in a separate terminal with `npm run dev:server`. The health endpoint is `http://localhost:5000/api/health`.

## MongoDB configuration

Set `MONGODB_URI` in `server/.env`. When present, the server connects through Mongoose at startup. If it is omitted, the server remains available and the health endpoint reports that the database is not configured. The frontend reads only `VITE_`-prefixed variables from `client/.env`, so `MONGODB_URI` is never exposed to browser code.
