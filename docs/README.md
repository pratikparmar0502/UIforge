# UIForge Documentation

Documentation for future UIForge milestones will live in this directory.

## Project and Generation Data Layer

Projects store a name, optional original screenshot reference, selected framework and styling preferences, and creation timestamps. Generations belong to a project and store optional screenshot, UI specification, generated-code, prompt, model, and status data for future milestones.

### Project API

- `POST /api/projects` creates a project. A non-empty `name` is required.
- `GET /api/projects` lists projects, newest first.
- `GET /api/projects/:id` retrieves a project by MongoDB ObjectId.
- `DELETE /api/projects/:id` deletes a project and all of its generations.
