# API

## Status

Milestone 4 implements structured analysis and one-round follow-up Q&A. File upload and recruitment-source collection remain out of scope.

## Implemented So Far

### `GET /api/health`

Returns a structured JSON health response for the placeholder server.

Response:

```json
{
  "service": "job-agent-server",
  "status": "ok",
  "milestone": 4
}
```

### `POST /api/analyze`

Accepts a job description and resume, then returns structured analysis fields for frontend rendering.

Request:

```json
{
  "job_description": "We need a frontend developer with React, JavaScript, testing, and API experience.",
  "resume": "Frontend developer with React, JavaScript, and Node.js project experience."
}
```

Response:

```json
{
  "requirements": {
    "summary": "Job description received with 12 words: We need a frontend developer with React, JavaScript, testing, and API experience.",
    "detected_skills": ["JavaScript", "React", "Node.js", "Testing"],
    "source": "job_description"
  },
  "resume_summary": {
    "summary": "Resume received with 9 words: Frontend developer with React, JavaScript, and Node.js project experience.",
    "detected_skills": ["JavaScript", "React", "Node.js"],
    "source": "resume"
  },
  "match_summary": {
    "score": 75,
    "summary": "Partial placeholder match. Current heuristic score is 75; matched 3 tracked skills and found 1 tracked gaps.",
    "matched_skills": ["JavaScript", "React", "Node.js"],
    "missing_skills": ["Testing"]
  },
  "gap_list": [
    {
      "skill": "Testing",
      "priority": "high",
      "reason": "The JD mentions Testing, but the resume does not mention it in the current text.",
      "recommendation": "Add concrete Testing project evidence or prepare a short explanation of related experience."
    }
  ],
  "study_plan": [
    {
      "day": 1,
      "focus": "Testing",
      "task": "Review Testing, prepare one resume-backed example, and write two interview talking points."
    }
  ],
  "interview_questions": [
    {
      "focus": "JavaScript",
      "question": "Describe a project where you used JavaScript and explain the tradeoffs you made."
    },
    {
      "focus": "React",
      "question": "Describe a project where you used React and explain the tradeoffs you made."
    },
    {
      "focus": "Node.js",
      "question": "Describe a project where you used Node.js and explain the tradeoffs you made."
    },
    {
      "focus": "Testing",
      "question": "Describe a project where you used Testing and explain the tradeoffs you made."
    },
    {
      "focus": "skill gap",
      "question": "How would you ramp up on Testing for this role in the first two weeks?"
    }
  ]
}
```

Stable response fields:

```json
{
  "requirements": {},
  "resume_summary": {},
  "match_summary": {},
  "gap_list": [],
  "study_plan": [],
  "interview_questions": []
}
```

Validation error response:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Field `job_description` is required and must be a non-empty string."
  }
}
```

### `POST /api/followup`

Accepts the current analysis result and one follow-up question, then returns an answer grounded in that explicit context. The server does not store long-term conversation state.

Request:

```json
{
  "analysis_result": {
    "match_summary": {
      "score": 75,
      "summary": "Partial placeholder match. Current heuristic score is 75; matched 3 tracked skills and found 1 tracked gaps.",
      "missing_skills": ["Testing"]
    },
    "gap_list": [
      {
        "skill": "Testing",
        "priority": "high",
        "reason": "The JD mentions Testing, but the resume does not mention it in the current text.",
        "recommendation": "Add concrete Testing project evidence or prepare a short explanation of related experience."
      }
    ],
    "study_plan": [
      {
        "day": 1,
        "focus": "Testing",
        "task": "Review Testing, prepare one resume-backed example, and write two interview talking points."
      }
    ],
    "interview_questions": [
      {
        "focus": "Testing",
        "question": "Describe a project where you used Testing and explain the tradeoffs you made."
      }
    ]
  },
  "question": "What are my biggest weaknesses and how should I improve?"
}
```

Response:

```json
{
  "answer": "Match summary: Partial placeholder match. Current heuristic score is 75; matched 3 tracked skills and found 1 tracked gaps. Start with these gaps: Testing. Priority: high. Reason: The JD mentions Testing, but the resume does not mention it in the current text. Recommendation: Add concrete Testing project evidence or prepare a short explanation of related experience. Use the study plan next: Day 1: focus on Testing. Task: Review Testing, prepare one resume-backed example, and write two interview talking points. Then practice with: Describe a project where you used Testing and explain the tradeoffs you made."
}
```

Validation error response:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Field `question` is required and must be a non-empty string."
  }
}
```

## Future Architecture Note

File uploads begin in Milestone 5. Recruitment-source collection remains out of scope for Milestone 4; later ingestion providers should normalize source-specific postings before passing data into the analysis service.
