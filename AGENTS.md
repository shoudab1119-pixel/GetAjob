\# AGENTS.md

\## Project
This repository builds a Job Agent product.

Core product capabilities:
\- analyze a target JD
\- analyze a user's resume
\- generate match analysis
\- generate skill-gap recommendations
\- generate interview preparation content

Future capability that must be supported by architecture:
\- collect job postings from recruitment websites
\- normalize postings into a common schema
\- rank jobs by fit
\- support follow-up analysis on selected jobs

\## Working Rules
\- Read docs/spec.md and PLAN.md before making changes
\- Stay within the current milestone
\- Keep diffs small and reviewable
\- Do not perform unrelated refactors
\- Prefer modular code organization
\- Design current data models so future recruitment-source adapters can be added

\## Output Rules
\- Prefer structured JSON responses where possible
\- Keep frontend-facing fields stable
\- If you change API contracts, update docs/api.md

\## Validation
\- Run lint / test / build if available
\- If validation cannot run, state exactly why
\- If validation fails, fix before continuing

\## Reporting
Always report:

1. what changed
2. why
3. validation results
4. risks / follow-ups