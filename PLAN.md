# PLAN.md

## Project
Job Agent

## Product Goal
Build a single-agent product that helps users:
1. analyze a target JD
2. analyze their resume
3. evaluate job fit
4. identify skill gaps
5. generate interview preparation content

## Roadmap Constraint
A later version must support collecting job postings from recruitment websites, normalizing them into a common schema, ranking them by fit, and allowing users to continue analysis on selected jobs.

That future capability must be considered in the architecture from the beginning, but it is not required in V1 implementation unless explicitly included in the milestone.

---

## Success Criteria
The product is successful if a user can:
1. provide a JD and a resume
2. receive a structured fit analysis
3. understand strengths, weaknesses, and priority skill gaps
4. get a practical study plan
5. get targeted interview preparation content
6. later extend the same system to job-source collection and recommendation

---

## V1 Scope
### Included
- JD input
- Resume input
- JD parsing
- Resume parsing
- Match analysis
- Skill-gap recommendations
- Interview preparation output
- Follow-up Q&A based on prior analysis

### Excluded
- login / account system
- persistent history
- auto-apply workflows
- browser automation
- full recruitment-site crawling implementation
- multi-agent architecture

---

## Architecture Principles
1. Single-agent first
2. Structured outputs first
3. Frontend rendering should depend on stable response schema
4. Job ingestion and job analysis must be separable
5. Future recruitment-site providers should be pluggable through adapters/providers
6. Minimal dependencies unless clearly justified
7. Validation is required at every milestone

---

## Milestone 1 — Project Skeleton and Core Docs
### Goal
Set up the repository so implementation can proceed in a controlled way.

### Deliverables
- base repo structure
- `AGENTS.md`
- `docs/spec.md`
- `docs/api.md`
- minimal `app/` scaffold
- minimal `server/` scaffold
- startup instructions

### Acceptance Criteria
- repository structure exists and is runnable in placeholder form
- docs are present and aligned
- app and server can start with placeholder behavior
- no full product logic yet

### Out of Scope
- real analysis logic
- production UI
- external job collection

---

## Milestone 2 — Input Flow and Basic UI
### Goal
Allow the user to provide a JD and a resume, submit them, and see basic result states.

### Deliverables
- JD input area
- resume input area
- submit action
- loading state
- error state
- result placeholder sections

### Acceptance Criteria
- user can input or paste JD
- user can input or paste resume
- submit flow works end to end with mock or placeholder response
- UI clearly separates loading, error, and result states
- layout leaves room for future recommended jobs section

### Out of Scope
- final visual design
- final backend analysis
- file upload if it slows the milestone

---

## Milestone 3 — Analyze API and Structured Output
### Goal
Implement the backend endpoint that accepts JD and resume and returns structured analysis.

### Deliverables
- `POST /api/analyze`
- stable response schema
- server-side analysis orchestration
- sample request/response documentation

### Minimum Response Shape
- `requirements`
- `resume_summary`
- `match_summary`
- `gap_list`
- `study_plan`
- `interview_questions`

### Acceptance Criteria
- endpoint accepts valid input
- endpoint returns structured JSON
- frontend can render returned sections without schema guessing
- invalid input is handled with clear errors

### Out of Scope
- job-source ingestion
- ranking multiple jobs
- persistent storage unless needed

---

## Milestone 4 — Follow-up Q&A
### Goal
Let the user ask follow-up questions based on the previous analysis.

### Deliverables
- `POST /api/followup`
- context handoff design
- frontend follow-up UI
- example follow-up flow

### Acceptance Criteria
- follow-up answers are grounded in prior analysis
- answers remain consistent with earlier structured result
- minimal context strategy is documented
- UI supports at least one round-trip follow-up

### Out of Scope
- long-term conversation memory
- multi-session user history

---

## Milestone 5 — File Input Support
### Goal
Support file-based JD and resume input.

### Deliverables
- file upload support for JD/resume
- file parsing boundary
- validation and error handling

### Acceptance Criteria
- user can upload supported file types
- parse failures are surfaced clearly
- text extraction result can feed the same analyze pipeline

### Out of Scope
- OCR-heavy workflows
- broad enterprise document handling

---

## Milestone 6 — Analysis Quality Improvements
### Goal
Improve trust and usefulness of analysis output.

### Deliverables
- stronger extraction logic
- clearer scoring logic or scoring rationale
- better gap prioritization
- more actionable study plan and interview questions

### Acceptance Criteria
- output is more specific and less generic
- each key recommendation has a reason
- match summary is understandable and consistent
- study plan is time-bounded and prioritized

---

## Milestone 7 — V2 Architecture Prep for Recruitment Sources
### Goal
Prepare the system to support recruitment-site collection later without rewriting the analysis core.

### Deliverables
- normalized `JobPosting` schema
- provider/adapter boundary for job sources
- service boundary between ingestion and analysis
- documentation for V2 integration

### Acceptance Criteria
- a common job-posting model exists
- future providers can map raw site data into that model
- analysis can consume normalized jobs without depending on source-specific fields
- placeholders are documented clearly

### Out of Scope
- full crawling/scraping implementation
- production scheduling
- anti-bot handling
- account login automation for external sites

---

## Milestone 8 — Recruitment-Site Collection (V2)
### Goal
Collect jobs from approved sources and rank them by fit.

### Deliverables
- one or more job-source adapters
- normalized job ingestion pipeline
- filtering by city / salary / experience / keyword
- ranking by resume fit
- recommended jobs view

### Acceptance Criteria
- system can ingest jobs from at least one source
- normalized jobs are stored or passed consistently
- ranking produces a usable recommended list
- user can select a job and continue fit analysis

### Constraints
- must respect source rules, robots, and terms
- collection logic should be replaceable and throttled
- source-specific breakage should not break the whole app

---

## Validation Rules
Every milestone must end with:
1. changed files list
2. explanation of changes
3. validation steps run
4. validation results
5. risks / follow-ups
6. next milestone recommendation

If lint/test/build exist, run them.
If they do not exist yet, explain what was validated manually.

---

## Repo-Level Open Questions
1. Which runtime/framework should be used for app?
2. Which runtime/framework should be used for server?
3. Will structured outputs be generated directly by one analysis service or split into sub-steps internally?
4. What file types must be supported first?
5. Which recruitment sites are in scope for V2?

If not yet decided, implement in a way that keeps these choices replaceable.

---

## Current Execution Order
1. Milestone 1
2. Milestone 2
3. Milestone 3
4. Milestone 4
5. Milestone 5
6. Milestone 6
7. Milestone 7
8. Milestone 8