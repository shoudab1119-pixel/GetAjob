# API

## Status

Milestone 7 adds architecture preparation for future recruitment-source integration while keeping the current API contracts stable. File input remains client-side text parsing. OCR, PDF/DOCX parsing, recommended jobs, persistence, crawling, scraping, browser automation, and login automation remain out of scope.

## Implemented So Far

### `GET /api/health`

Returns a structured JSON health response for the placeholder server.

Response excerpt:

```json
{
  "service": "job-agent-server",
  "status": "ok",
  "milestone": 7
}
```

### `POST /api/analyze`

Accepts a job description and resume, then returns structured analysis fields for frontend rendering.

Request:

```json
{
  "job_description": "Build React and TypeScript product screens, maintain Next.js frontend routes, design Node.js REST APIs, write Jest tests, model PostgreSQL data, and deploy releases on AWS.",
  "resume": "Built a React TypeScript dashboard with Next.js routes, implemented a Node.js REST API, wrote Jest tests, modeled PostgreSQL tables, and deployed the project to AWS."
}
```

Response:

```json
{
  "requirements": {
    "summary": "Job description received with 25 words: Build React and TypeScript product screens, maintain Next.js frontend routes, design Node.js REST APIs, write Jest tests, model PostgreSQL data, and deploy releases on AWS.",
    "detected_skills": [
      {
        "skill": "JavaScript/TypeScript",
        "category": "frontend foundation",
        "evidence": ["Build React and TypeScript product screens, maintain Next.js frontend routes, design Node.js REST APIs, write Jest tests, model PostgreSQL data, and deploy releases on AWS."]
      }
    ],
    "responsibilities": [
      "Build React and TypeScript product screens, maintain Next.js frontend routes, design Node.js REST APIs, write Jest tests, model PostgreSQL data, and deploy releases on AWS."
    ],
    "required_focus": ["JavaScript/TypeScript", "React/Next.js", "Node.js/API", "Testing", "Database", "Cloud/Deployment"],
    "source": "job_description"
  },
  "resume_summary": {
    "summary": "Resume received with 25 words: Built a React TypeScript dashboard with Next.js routes, implemented a Node.js REST API, wrote Jest tests, modeled PostgreSQL tables, and deployed the project to AWS.",
    "detected_skills": [
      {
        "skill": "JavaScript/TypeScript",
        "category": "frontend foundation",
        "evidence": ["Built a React TypeScript dashboard with Next.js routes, implemented a Node.js REST API, wrote Jest tests, modeled PostgreSQL tables, and deployed the project to AWS."]
      }
    ],
    "evidence": [
      "Built a React TypeScript dashboard with Next.js routes, implemented a Node.js REST API, wrote Jest tests, modeled PostgreSQL tables, and deployed the project to AWS."
    ],
    "source": "resume"
  },
  "match_summary": {
    "score": 100,
    "summary": "Strong match. The resume covers all tracked JD skills with a score of 100; focus on presenting concrete project evidence.",
    "strengths": [
      {
        "skill": "JavaScript/TypeScript",
        "reason": "The JD asks for JavaScript/TypeScript, and the resume mentions related evidence.",
        "jd_evidence": "Build React and TypeScript product screens, maintain Next.js frontend routes, design Node.js REST APIs, write Jest tests, model PostgreSQL data, and deploy releases on AWS."
      }
    ],
    "weaknesses": [],
    "matched_skills": ["JavaScript/TypeScript", "React/Next.js", "Node.js/API", "Testing", "Database", "Cloud/Deployment"],
    "missing_skills": [],
    "scoring_rationale": "Weighted skill coverage contributes 80 points and resume evidence quality contributes 20 points."
  },
  "gap_list": [
    {
      "skill": "No tracked gap detected",
      "priority": "low",
      "reason": "The resume covers every tracked skill found in the JD.",
      "recommendation": "Use the interview questions to prepare concise project evidence for the strongest matched skills."
    }
  ],
  "study_plan": [
    {
      "day": 1,
      "focus": "JavaScript/TypeScript",
      "task": "Review the JD evidence for JavaScript/TypeScript and write a short explanation of your closest related experience.",
      "outcome": "One resume-ready bullet and one interview talking point."
    }
  ],
  "interview_questions": [
    {
      "focus": "JavaScript/TypeScript",
      "question": "The JD emphasizes JavaScript/TypeScript. Walk me through a project where you used it, including the tradeoff you made and the result.",
      "why_it_matters": "Resume evidence to use: Built a React TypeScript dashboard with Next.js routes, implemented a Node.js REST API, wrote Jest tests, modeled PostgreSQL tables, and deployed the project to AWS."
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

## File Input Behavior

File input is handled in the frontend before calling `POST /api/analyze`. The API request shape remains stable:

```json
{
  "job_description": "extracted JD text",
  "resume": "extracted resume text"
}
```

Supported file types in Milestone 5:

```json
[".txt", ".md", ".json"]
```

Frontend validation errors are shown to the user for:

```json
[
  "Unsupported file type. Please upload a .txt, .md, or .json file.",
  "Uploaded file is empty.",
  "Uploaded JSON file could not be parsed."
]
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

## V2 Recruitment Source Architecture

Milestone 7 introduces a normalized `JobPosting` model for future job-source data. This is not exposed as a public API endpoint yet.

Normalized shape:

```json
{
  "title": "Frontend Engineer",
  "company": "Example Co",
  "city": "Shanghai",
  "salary": "20k-30k CNY",
  "experience_requirement": "3+ years",
  "education_requirement": "Bachelor preferred",
  "skills": ["React", "TypeScript", "Jest"],
  "responsibilities": ["Build product screens", "Maintain API integrations"],
  "source": "example-board",
  "source_url": "https://example.com/jobs/frontend",
  "published_at": "2026-04-01"
}
```

Provider boundary:

```js
createJobSourceProvider({
  name: "example-board",
  mapRawPosting(rawPosting) {
    return {
      title: rawPosting.position_name,
      company: rawPosting.org,
      city: rawPosting.location_text,
      salary: rawPosting.pay_range,
      experience_requirement: rawPosting.exp,
      education_requirement: rawPosting.degree,
      skills: rawPosting.tags,
      responsibilities: rawPosting.duties,
      source_url: rawPosting.url,
      published_at: rawPosting.date
    };
  }
});
```

Future flow:

```text
source-specific raw posting -> provider adapter -> normalized JobPosting -> analysis input
```

The analysis service should consume normalized job data by converting `JobPosting` to a job-description-like text input, rather than depending on source-specific fields such as `position_name` or `org`.

## Future Architecture Note

PDF/DOCX parsing and OCR remain out of scope for Milestone 7. Recruitment-source collection remains out of scope; later ingestion providers should normalize source-specific postings before passing data into the analysis service.
