# Job Agent

Single-agent product for job description and resume analysis.

## Current Milestone

Milestone 4: follow-up Q&A.

This milestone provides a runnable frontend input flow connected to `POST /api/analyze`, plus one-round follow-up Q&A through `POST /api/followup`. It does not implement file uploads or recruitment-source collection.

## Structure

```text
app/        Frontend app with JD/resume input and follow-up flow
server/     Backend server with analyze and follow-up endpoints
docs/       Product and API documentation
```

## Run

Start the API server:

```sh
npm run start:server
```

Then check:

```text
http://localhost:3000/api/health
```

In a second terminal, start the app:

```sh
npm run start:app
```

Then open:

```text
http://localhost:5173
```

## Validate

```sh
npm run check
```
