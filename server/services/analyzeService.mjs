const keywordGroups = [
  {
    skill: "JavaScript",
    patterns: [/javascript/i, /\bjs\b/i, /typescript/i, /\bts\b/i],
  },
  {
    skill: "React",
    patterns: [/react/i, /next\.?js/i, /frontend/i, /front-end/i],
  },
  {
    skill: "Node.js",
    patterns: [/node\.?js/i, /express/i, /backend/i, /api/i],
  },
  {
    skill: "Testing",
    patterns: [/test/i, /testing/i, /jest/i, /playwright/i, /cypress/i],
  },
  {
    skill: "Database",
    patterns: [/database/i, /sql/i, /postgres/i, /mysql/i, /mongodb/i],
  },
  {
    skill: "Cloud",
    patterns: [/cloud/i, /aws/i, /azure/i, /gcp/i, /vercel/i],
  },
];

export function analyzeJobFit({ job_description, resume }) {
  const normalizedJob = normalizeText(job_description);
  const normalizedResume = normalizeText(resume);
  const jobSkills = findSkills(normalizedJob);
  const resumeSkills = findSkills(normalizedResume);
  const matchedSkills = jobSkills.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = jobSkills.filter((skill) => !resumeSkills.includes(skill));
  const matchScore =
    jobSkills.length === 0 ? 0 : Math.round((matchedSkills.length / jobSkills.length) * 100);

  return {
    requirements: {
      summary: summarizeText(job_description, "Job description"),
      detected_skills: jobSkills,
      source: "job_description",
    },
    resume_summary: {
      summary: summarizeText(resume, "Resume"),
      detected_skills: resumeSkills,
      source: "resume",
    },
    match_summary: {
      score: matchScore,
      summary: buildMatchSummary(matchScore, matchedSkills, missingSkills),
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
    },
    gap_list: buildGapList(missingSkills),
    study_plan: buildStudyPlan(missingSkills),
    interview_questions: buildInterviewQuestions(jobSkills, missingSkills),
  };
}

function normalizeText(value) {
  return value.trim();
}

function findSkills(text) {
  return keywordGroups
    .filter((group) => group.patterns.some((pattern) => pattern.test(text)))
    .map((group) => group.skill);
}

function summarizeText(value, label) {
  const words = normalizeText(value).split(/\s+/).filter(Boolean);
  const preview = words.slice(0, 28).join(" ");

  if (words.length <= 28) {
    return `${label} received with ${words.length} words: ${preview}`;
  }

  return `${label} received with ${words.length} words: ${preview}...`;
}

function buildMatchSummary(score, matchedSkills, missingSkills) {
  if (matchedSkills.length === 0 && missingSkills.length === 0) {
    return "No tracked technical keywords were detected yet. Add more specific JD and resume details for a stronger analysis.";
  }

  if (missingSkills.length === 0) {
    return `Strong placeholder match across tracked skills. Current heuristic score is ${score}.`;
  }

  if (matchedSkills.length === 0) {
    return `Low placeholder match across tracked skills. Current heuristic score is ${score}; prioritize the listed gaps.`;
  }

  return `Partial placeholder match. Current heuristic score is ${score}; matched ${matchedSkills.length} tracked skills and found ${missingSkills.length} tracked gaps.`;
}

function buildGapList(missingSkills) {
  if (missingSkills.length === 0) {
    return [
      {
        skill: "No tracked gap detected",
        priority: "low",
        reason: "The resume mentions all tracked skills found in the JD.",
        recommendation: "Use Milestone 6 to replace this heuristic with deeper evidence-based scoring.",
      },
    ];
  }

  return missingSkills.map((skill, index) => ({
    skill,
    priority: index < 2 ? "high" : "medium",
    reason: `The JD mentions ${skill}, but the resume does not mention it in the current text.`,
    recommendation: `Add concrete ${skill} project evidence or prepare a short explanation of related experience.`,
  }));
}

function buildStudyPlan(missingSkills) {
  const focusSkills = missingSkills.length > 0 ? missingSkills : ["role-specific project evidence"];

  return focusSkills.slice(0, 3).map((skill, index) => ({
    day: index + 1,
    focus: skill,
    task: `Review ${skill}, prepare one resume-backed example, and write two interview talking points.`,
  }));
}

function buildInterviewQuestions(jobSkills, missingSkills) {
  const focusSkills = jobSkills.length > 0 ? jobSkills : ["the target role"];
  const questions = focusSkills.slice(0, 4).map((skill) => ({
    focus: skill,
    question: `Describe a project where you used ${skill} and explain the tradeoffs you made.`,
  }));

  if (missingSkills.length > 0) {
    questions.push({
      focus: "skill gap",
      question: `How would you ramp up on ${missingSkills[0]} for this role in the first two weeks?`,
    });
  }

  return questions;
}
