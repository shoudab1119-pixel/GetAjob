import assert from "node:assert/strict";
import { analyzeJobFit } from "../server/services/analyzeService.mjs";

const requiredFields = [
  "requirements",
  "resume_summary",
  "match_summary",
  "gap_list",
  "study_plan",
  "interview_questions",
];

function assertTopLevelSchema(result) {
  for (const field of requiredFields) {
    assert.ok(Object.hasOwn(result, field), `missing top-level field: ${field}`);
  }
}

function runThinResumeCase() {
  const result = analyzeJobFit({
    job_description:
      "We need a frontend engineer to build React and TypeScript applications, design Node.js APIs, write Jest tests, work with PostgreSQL, and deploy on AWS.",
    resume: "Student project: built a small React todo app.",
  });

  assertTopLevelSchema(result);
  assert.ok(result.match_summary.score < 60, "thin resume should not score as a strong match");
  assert.ok(result.match_summary.weaknesses.length >= 3, "thin resume should expose multiple gaps");
  assert.ok(
    result.gap_list.some((gap) => gap.priority === "high"),
    "high-weight missing skills should produce high priority gaps",
  );
  assert.equal(result.study_plan.length, 7, "study plan should be time-bounded to 7 days");
  assert.ok(
    result.interview_questions.some((question) => question.why_it_matters.includes("gap")),
    "interview questions should include a gap-grounded question",
  );
}

function runGoodMatchCase() {
  const result = analyzeJobFit({
    job_description:
      "Build React and TypeScript product screens, maintain Next.js frontend routes, design Node.js REST APIs, write Jest tests, model PostgreSQL data, and deploy releases on AWS.",
    resume:
      "Built a React TypeScript dashboard with Next.js routes, implemented a Node.js REST API, wrote Jest tests, modeled PostgreSQL tables, and deployed the project to AWS.",
  });

  assertTopLevelSchema(result);
  assert.ok(result.match_summary.score >= 85, "good match should score high");
  assert.equal(result.match_summary.missing_skills.length, 0, "good match should have no tracked missing skills");
  assert.ok(
    result.match_summary.strengths.length >= 5,
    "good match should show multiple concrete strengths",
  );
  assert.ok(
    result.interview_questions[0].why_it_matters.includes("Resume evidence"),
    "questions should point to resume evidence when available",
  );
  assert.ok(
    !result.study_plan[2].task.includes("missing"),
    "good match plan should not describe matched skills as missing",
  );
}

runThinResumeCase();
runGoodMatchCase();

console.log("analyzeService tests passed");
