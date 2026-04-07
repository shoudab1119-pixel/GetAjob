export const jobPostingFields = [
  "title",
  "company",
  "city",
  "salary",
  "experience_requirement",
  "education_requirement",
  "skills",
  "responsibilities",
  "source",
  "source_url",
  "published_at",
];

const requiredTextFields = ["title", "company", "source"];

function textOrEmpty(value) {
  return typeof value === "string" ? value.trim() : "";
}

function textOrNull(value) {
  const text = textOrEmpty(value);
  return text ? text : null;
}

function stringList(value) {
  if (!Array.isArray(value)) {
    return textOrEmpty(value) ? [textOrEmpty(value)] : [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function isValidOptionalUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidOptionalDate(value) {
  return !value || !Number.isNaN(Date.parse(value));
}

export function createJobPosting(input = {}) {
  const safeInput = input && typeof input === "object" && !Array.isArray(input) ? input : {};

  return {
    title: textOrEmpty(safeInput.title),
    company: textOrEmpty(safeInput.company),
    city: textOrEmpty(safeInput.city),
    salary: textOrNull(safeInput.salary),
    experience_requirement: textOrNull(safeInput.experience_requirement),
    education_requirement: textOrNull(safeInput.education_requirement),
    skills: stringList(safeInput.skills),
    responsibilities: stringList(safeInput.responsibilities),
    source: textOrEmpty(safeInput.source),
    source_url: textOrNull(safeInput.source_url),
    published_at: textOrNull(safeInput.published_at),
  };
}

export function validateJobPosting(jobPosting) {
  const errors = [];

  if (!jobPosting || typeof jobPosting !== "object" || Array.isArray(jobPosting)) {
    return {
      valid: false,
      errors: ["JobPosting must be an object."],
    };
  }

  for (const field of jobPostingFields) {
    if (!Object.hasOwn(jobPosting, field)) {
      errors.push(`Missing field: ${field}.`);
    }
  }

  for (const field of requiredTextFields) {
    if (typeof jobPosting[field] !== "string" || !jobPosting[field].trim()) {
      errors.push(`Field \`${field}\` is required and must be a non-empty string.`);
    }
  }

  for (const field of ["skills", "responsibilities"]) {
    if (!Array.isArray(jobPosting[field])) {
      errors.push(`Field \`${field}\` must be an array.`);
    }
  }

  if (!isValidOptionalUrl(jobPosting.source_url)) {
    errors.push("Field `source_url` must be an http or https URL when present.");
  }

  if (!isValidOptionalDate(jobPosting.published_at)) {
    errors.push("Field `published_at` must be a parseable date string when present.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function jobPostingToJobDescription(jobPosting) {
  const normalized = createJobPosting(jobPosting);
  const lines = [
    `Title: ${normalized.title}`,
    `Company: ${normalized.company}`,
    normalized.city ? `City: ${normalized.city}` : "",
    normalized.salary ? `Salary: ${normalized.salary}` : "",
    normalized.experience_requirement
      ? `Experience requirement: ${normalized.experience_requirement}`
      : "",
    normalized.education_requirement
      ? `Education requirement: ${normalized.education_requirement}`
      : "",
    normalized.skills.length ? `Skills: ${normalized.skills.join(", ")}` : "",
    normalized.responsibilities.length
      ? `Responsibilities: ${normalized.responsibilities.join(" ")}`
      : "",
    normalized.source ? `Source: ${normalized.source}` : "",
    normalized.source_url ? `Source URL: ${normalized.source_url}` : "",
    normalized.published_at ? `Published at: ${normalized.published_at}` : "",
  ];

  return lines.filter(Boolean).join("\n");
}
