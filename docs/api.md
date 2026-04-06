# API

## Status

Milestone 1 defines only placeholder runtime behavior. Product analysis endpoints are intentionally not implemented yet.

## Implemented in Milestone 1

### `GET /api/health`

Returns a structured JSON health response for the placeholder server.

Response:

```json
{
  "service": "job-agent-server",
  "status": "ok",
  "milestone": 1
}
```

## Planned for Later Milestones

### `POST /api/analyze`

Planned for Milestone 3. It will accept a job description and resume, then return structured analysis fields for frontend rendering.

Expected future response sections:

```json
{
  "requirements": [],
  "resume_summary": {},
  "match_summary": {},
  "gap_list": [],
  "study_plan": [],
  "interview_questions": []
}
```

### `POST /api/followup`

Planned for Milestone 4. It will answer follow-up questions grounded in the prior analysis context.

## Future Architecture Note

Recruitment-source collection is out of scope for Milestone 1. Later ingestion providers should normalize source-specific postings before passing data into the analysis service.
