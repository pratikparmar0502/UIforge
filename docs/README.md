# UIForge Documentation

Documentation for future UIForge milestones will live in this directory.

## Project and Generation Data Layer

Projects store a name, optional original screenshot reference, selected framework and styling preferences, and creation timestamps. Generations belong to a project and store optional screenshot, UI specification, generated-code, prompt, model, and status data for future milestones.

### Project API

- `POST /api/projects` creates a project. A non-empty `name` is required.
- `GET /api/projects` lists projects, newest first.
- `GET /api/projects/:id` retrieves a project by MongoDB ObjectId.
- `DELETE /api/projects/:id` deletes a project and all of its generations.

## Screenshot Upload and Generations

`POST /api/generations` accepts multipart form data with a required `screenshot` field. PNG, JPEG, and WebP images up to 5 MB are supported. Optional `projectId`, `framework`, and `styling` fields associate the generation with an existing project and record its requested output preferences.

Uploaded screenshots are stored locally in `server/uploads/` under generated filenames. The database stores the `/uploads/<filename>` reference rather than image binary data. Screenshots can be accessed through `GET /uploads/<filename>`.

- `POST /api/generations` accepts a screenshot and creates a generation with `pending` status.
- `GET /api/generations/:id` retrieves a generation by MongoDB ObjectId.

`pending` means the screenshot has been accepted and saved, but AI processing has not happened yet.
