import assert from "node:assert/strict";
import { createJobSourceProvider } from "../server/ingestion/jobSourceProvider.mjs";
import {
  createJobPosting,
  jobPostingFields,
  jobPostingToJobDescription,
  validateJobPosting,
} from "../server/models/jobPosting.mjs";

function assertJobPostingShape(jobPosting) {
  assert.deepEqual(Object.keys(jobPosting), jobPostingFields);
}

function runNormalizedSchemaCase() {
  const jobPosting = createJobPosting({
    title: "Frontend Engineer",
    company: "Example Co",
    city: "Shanghai",
    salary: "20k-30k CNY",
    experience_requirement: "3+ years",
    education_requirement: "Bachelor preferred",
    skills: ["React", "TypeScript", "Jest"],
    responsibilities: ["Build product screens", "Maintain API integrations"],
    source: "manual",
    source_url: "https://example.com/jobs/frontend",
    published_at: "2026-04-01",
  });

  assertJobPostingShape(jobPosting);
  assert.deepEqual(validateJobPosting(jobPosting), { valid: true, errors: [] });
}

function runProviderMappingCase() {
  const provider = createJobSourceProvider({
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
        published_at: rawPosting.date,
      };
    },
  });

  const { jobPosting, validation } = provider.normalize({
    position_name: "Full Stack Developer",
    org: "Example Co",
    location_text: "Remote",
    pay_range: "Negotiable",
    exp: "2+ years",
    degree: "No strict requirement",
    tags: ["React", "Node.js", "PostgreSQL"],
    duties: ["Build frontend features", "Design Node.js APIs"],
    url: "https://example.com/jobs/full-stack",
    date: "2026-04-02",
  });

  assertJobPostingShape(jobPosting);
  assert.equal(jobPosting.source, "example-board");
  assert.equal(validation.valid, true);
  assert.equal(jobPosting.title, "Full Stack Developer");
  assert.deepEqual(jobPosting.skills, ["React", "Node.js", "PostgreSQL"]);
}

function runAnalysisInputBoundaryCase() {
  const jobPosting = createJobPosting({
    title: "React Developer",
    company: "Example Co",
    skills: ["React", "TypeScript"],
    responsibilities: ["Build accessible UI", "Write Jest tests"],
    source: "example-board",
  });

  const jobDescription = jobPostingToJobDescription(jobPosting);

  assert.match(jobDescription, /Title: React Developer/);
  assert.match(jobDescription, /Skills: React, TypeScript/);
  assert.match(jobDescription, /Responsibilities: Build accessible UI Write Jest tests/);
  assert.doesNotMatch(jobDescription, /position_name/);
}

function runInvalidPostingCase() {
  assert.deepEqual(validateJobPosting(null), {
    valid: false,
    errors: ["JobPosting must be an object."],
  });

  const jobPosting = createJobPosting({
    title: "",
    company: "",
    source: "",
    source_url: "not-a-url",
    published_at: "not-a-date",
  });
  const validation = validateJobPosting(jobPosting);

  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.includes("`title`")));
  assert.ok(validation.errors.some((error) => error.includes("`company`")));
  assert.ok(validation.errors.some((error) => error.includes("`source`")));
  assert.ok(validation.errors.some((error) => error.includes("`source_url`")));
  assert.ok(validation.errors.some((error) => error.includes("`published_at`")));
}

runNormalizedSchemaCase();
runProviderMappingCase();
runAnalysisInputBoundaryCase();
runInvalidPostingCase();

console.log("jobPosting tests passed");
