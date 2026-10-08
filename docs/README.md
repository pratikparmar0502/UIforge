# UIForge Documentation

Documentation for UIForge milestones lives in this directory.

## Project and Generation Data Layer

Projects store a name, optional original screenshot reference, selected framework and styling preferences, and creation timestamps. Generations belong to a project and store optional screenshot, UI specification, generated-code, prompt, model, and status data for later milestones.

### Project API

- `POST /api/projects` creates a project. A non-empty `name` is required.
- `GET /api/projects` lists projects, newest first.
- `GET /api/projects/:id` retrieves a project by MongoDB ObjectId.
- `DELETE /api/projects/:id` deletes a project and all of its generations.

## Screenshot Upload and Generations

`POST /api/generations` accepts multipart form data with a required `screenshot` field. PNG, JPEG, and WebP images up to 5 MB are supported. Optional `projectId`, `framework`, and `styling` fields associate the generation with an existing project and record its requested output preferences.

Uploaded screenshots are stored locally in `server/uploads/` under generated filenames. The database stores the `/uploads/<filename>` reference rather than image binary data. Screenshots can be accessed through `GET /uploads/<filename>`.

- `POST /api/generations` accepts a screenshot and creates a generation with `pending` status.
- `GET /api/generations/:id` retrieves a generation by MongoDB ObjectId, including analysis fields when present.

`pending` means the screenshot has been accepted and saved, but AI processing has not happened yet. Upload does not start analysis automatically.

## Milestone 04: AI Screenshot Analysis

Milestone 04 analyzes a saved screenshot into a structured UI specification. It does not generate code, render a live preview, or add authentication.

### Local AI provider

Analysis uses a locally running [Ollama](https://ollama.com) server. The default model is `qwen3-vl:4b` (Qwen3-VL). No cloud AI provider and no API key are required.

The application talks to Ollama only through an AI provider adapter. Core generation logic should keep using `server/src/services/ai/ai.service.js` so another provider can be added later without rewriting controllers.

### Analysis flow

1. `POST /api/generations` saves the screenshot with status `pending`.
2. `POST /api/generations/:id/analyze` loads the saved image, sends it with a structured analysis prompt to Ollama, validates the JSON UI specification, and stores the result.
3. `GET /api/generations/:id` returns the generation, including `uiSpecification` and `model` when analysis has completed.

### Analyze endpoint

`POST /api/generations/:id/analyze`

- Validates the generation ID and returns 404 if the generation does not exist.
- Returns 400 if the generation has no screenshot file.
- Returns 409 if status is already `analyzing`.
- Sets status to `analyzing`, calls the AI provider, then saves `uiSpecification`, `prompt`, `model`, and the final status.
- Analysis requests are IP-rate-limited in memory. Screenshot uploads are not limited by these rules.

### UI specification

The model must return JSON only, with this top-level shape:

- `page`
- `layout`
- `sections`
- `components`
- `content`
- `styles`
- `assets`
- `responsiveHints`

The backend extracts JSON if the model wraps it in markdown fences, then validates that the root is an object and that the expected objects/arrays exist. Invalid output is not stored as a successful specification.

### Status lifecycle

- `pending` — screenshot saved, analysis not started
- `analyzing` — analysis request in progress
- `analyzed` — a valid UI specification was saved
- `failed` — analysis, parsing, or validation failed

Successful analysis moves `pending` (or a retry from `failed` / `analyzed`) to `analyzing`, then `analyzed`. Failures move `analyzing` to `failed`. Internal error text is stored server-side and is not returned by `GET /api/generations/:id`.

### Environment configuration

Set these in `server/.env` (see `server/.env.example`). They are backend-only and must not be copied into `VITE_` frontend variables.

- `AI_PROVIDER=ollama`
- `OLLAMA_BASE_URL=http://localhost:11434`
- `OLLAMA_MODEL=qwen3-vl:4b`
- `AI_ANALYSIS_COOLDOWN_SECONDS=15`
- `AI_ANALYSIS_MAX_PER_HOUR=10`
- `AI_ANALYSIS_MAX_PER_DAY=20`

### Limitations

- Ollama must already be running locally, and `qwen3-vl:4b` must be pulled.
- Analysis is not started from the upload endpoint; it is explicit.
- Rate limits are in-memory and reset if the server process restarts. They are IP-based because there is no authentication yet.
- A crash while status is `analyzing` can leave that generation stuck until a later improvement resets stale jobs.
- Vision output can still omit details or guess colors; validation only checks structure.
- Code generation and frontend analysis UI are out of scope for this milestone.
