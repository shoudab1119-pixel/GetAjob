# Job Agent

Single-agent product for job description and resume analysis.

## Current Milestone

Milestone 7: V2 architecture prep for recruitment sources.

This milestone adds a normalized `JobPosting` model and a provider boundary for future recruitment-source adapters. It keeps existing text/file input, analyze, and follow-up flows working, but does not implement crawling, scraping, scheduling, login automation, or recommended jobs.

## Structure

```text
app/        Frontend app with JD/resume text and file input flow
server/     Backend server with analyze/follow-up endpoints and V2 ingestion boundaries
docs/       Product and API documentation
tests/      Service and schema tests
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

File input supports `.txt`, `.md`, and `.json`. Uploaded content fills the same JD/resume text areas used by the analyze request.

## Validate

```sh
npm run check
npm run test
```
