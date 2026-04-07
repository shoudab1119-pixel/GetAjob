const skillCatalog = [
  {
    skill: "JavaScript/TypeScript",
    category: "frontend foundation",
    weight: 5,
    patterns: [/javascript/i, /\bjs\b/i, /typescript/i, /\bts\b/i],
  },
  {
    skill: "React/Next.js",
    category: "frontend framework",
    weight: 5,
    patterns: [/react/i, /next\.?js/i],
  },
  {
    skill: "Node.js/API",
    category: "backend integration",
    weight: 4,
    patterns: [/node\.?js/i, /express/i, /\bapi\b/i, /rest/i, /backend/i],
  },
  {
    skill: "Testing",
    category: "quality",
    weight: 4,
    patterns: [/test/i, /testing/i, /jest/i, /playwright/i, /cypress/i],
  },
  {
    skill: "Database",
    category: "data",
    weight: 3,
    patterns: [/database/i, /\bsql\b/i, /postgres/i, /mysql/i, /mongodb/i],
  },
  {
    skill: "Cloud/Deployment",
    category: "delivery",
    weight: 3,
    patterns: [/cloud/i, /aws/i, /azure/i, /gcp/i, /vercel/i, /deploy/i, /deployment/i],
  },
  {
    skill: "CSS/Accessibility",
    category: "frontend polish",
    weight: 2,
    patterns: [/css/i, /tailwind/i, /accessibility/i, /\ba11y\b/i, /responsive/i],
  },
];

const responsibilityPatterns = [
  /build/i,
  /develop/i,
  /implement/i,
  /design/i,
  /maintain/i,
  /optimi[sz]e/i,
  /collaborate/i,
  /own/i,
  /support/i,
  /deliver/i,
];

const resumeEvidencePatterns = [
  /built/i,
  /created/i,
  /developed/i,
  /implemented/i,
  /designed/i,
  /led/i,
  /improved/i,
  /deployed/i,
  /project/i,
  /experience/i,
];

export function analyzeJobFit({ job_description, resume }) {
  const normalizedJob = normalizeText(job_description);
  const normalizedResume = normalizeText(resume);
  const jobSentences = splitSentences(normalizedJob);
  const resumeSentences = splitSentences(normalizedResume);
  const jobSkillMatches = findSkillMatches(normalizedJob, jobSentences);
  const resumeSkillMatches = findSkillMatches(normalizedResume, resumeSentences);
  const jobSkillNames = jobSkillMatches.map((match) => match.skill);
  const resumeSkillNames = resumeSkillMatches.map((match) => match.skill);
  const matchedSkillNames = jobSkillNames.filter((skill) => resumeSkillNames.includes(skill));
  const missingSkillMatches = jobSkillMatches.filter(
    (match) => !resumeSkillNames.includes(match.skill),
  );
  const matchedSkillMatches = jobSkillMatches.filter((match) =>
    matchedSkillNames.includes(match.skill),
  );
  const scoreDetails = calculateScore(jobSkillMatches, resumeSkillMatches, matchedSkillMatches);

  return {
    requirements: buildRequirements(normalizedJob, jobSentences, jobSkillMatches),
    resume_summary: buildResumeSummary(normalizedResume, resumeSentences, resumeSkillMatches),
    match_summary: buildMatchSummary(scoreDetails, matchedSkillMatches, missingSkillMatches),
    gap_list: buildGapList(missingSkillMatches, resumeSkillMatches),
    study_plan: buildStudyPlan(missingSkillMatches, matchedSkillMatches),
    interview_questions: buildInterviewQuestions(matchedSkillMatches, missingSkillMatches, resumeSkillMatches),
  };
}

function buildRequirements(text, sentences, skillMatches) {
  return {
    summary: summarizeText(text, "Job description"),
    detected_skills: skillMatches.map(toSkillSummary),
    responsibilities: selectSentences(sentences, responsibilityPatterns, 4),
    required_focus: skillMatches.map((match) => match.skill),
    source: "job_description",
  };
}

function buildResumeSummary(text, sentences, skillMatches) {
  return {
    summary: summarizeText(text, "Resume"),
    detected_skills: skillMatches.map(toSkillSummary),
    evidence: selectSentences(sentences, resumeEvidencePatterns, 4),
    source: "resume",
  };
}

function buildMatchSummary(scoreDetails, matchedSkillMatches, missingSkillMatches) {
  const strengths = matchedSkillMatches.map((match) => ({
    skill: match.skill,
    reason: `The JD asks for ${match.skill}, and the resume mentions related evidence.`,
    jd_evidence: firstOrFallback(match.evidence, `JD mentions ${match.skill}.`),
  }));
  const weaknesses = missingSkillMatches.map((match) => ({
    skill: match.skill,
    reason: `The JD references ${match.skill}, but the resume text does not show matching evidence yet.`,
    jd_evidence: firstOrFallback(match.evidence, `JD mentions ${match.skill}.`),
  }));

  return {
    score: scoreDetails.score,
    summary: buildScoreSummary(scoreDetails.score, strengths, weaknesses),
    strengths,
    weaknesses,
    matched_skills: matchedSkillMatches.map((match) => match.skill),
    missing_skills: missingSkillMatches.map((match) => match.skill),
    scoring_rationale: scoreDetails.rationale,
  };
}

function buildGapList(missingSkillMatches, resumeSkillMatches) {
  if (missingSkillMatches.length === 0) {
    return [
      {
        skill: "No tracked gap detected",
        priority: "low",
        reason: "The resume covers every tracked skill found in the JD.",
        recommendation: "Use the interview questions to prepare concise project evidence for the strongest matched skills.",
      },
    ];
  }

  return [...missingSkillMatches]
    .sort((left, right) => right.weight - left.weight)
    .map((match) => ({
      skill: match.skill,
      priority: priorityForWeight(match.weight),
      reason: `JD evidence: ${firstOrFallback(match.evidence, `JD mentions ${match.skill}.`)} Resume evidence was not found for this skill.`,
      recommendation: recommendationForGap(match, resumeSkillMatches),
    }));
}

function buildStudyPlan(missingSkillMatches, matchedSkillMatches) {
  const gaps = missingSkillMatches.length > 0 ? missingSkillMatches : [];
  const strengths = matchedSkillMatches.length > 0 ? matchedSkillMatches : [];

  if (gaps.length === 0) {
    const primaryStrength = strengths[0]?.skill ?? "role-specific evidence";
    const secondaryStrength = strengths[1]?.skill ?? primaryStrength;
    const thirdStrength = strengths[2]?.skill ?? secondaryStrength;

    return [
      {
        day: 1,
        focus: primaryStrength,
        task: `Select the strongest ${primaryStrength} project and write a concise context-action-result summary.`,
        outcome: "One resume-ready bullet and one interview talking point.",
      },
      {
        day: 2,
        focus: secondaryStrength,
        task: `Prepare a deeper technical walkthrough for ${secondaryStrength}, including one tradeoff and one result.`,
        outcome: "A concrete project story for the second matched requirement.",
      },
      {
        day: 3,
        focus: thirdStrength,
        task: `Collect evidence for ${thirdStrength}: implementation detail, test or deployment proof, and measurable impact if available.`,
        outcome: "A stronger evidence set for a matched skill.",
      },
      {
        day: 4,
        focus: "role responsibilities",
        task: "Map each JD responsibility to direct resume evidence and identify where wording can be sharper.",
        outcome: "A clear JD-to-resume evidence table.",
      },
      {
        day: 5,
        focus: "scoring rationale",
        task: "Turn the strongest matches into a concise answer for why this role fits your background.",
        outcome: "A 60-second fit pitch.",
      },
      {
        day: 6,
        focus: "mock interview",
        task: "Practice the generated interview questions aloud and tighten weak or vague answers.",
        outcome: "Sharper interview responses grounded in project evidence.",
      },
      {
        day: 7,
        focus: "resume alignment",
        task: "Update the resume wording to surface the strongest matched skills near the top.",
        outcome: "A tighter resume version for this JD.",
      },
    ];
  }

  const primaryGap = gaps[0]?.skill ?? strengths[0]?.skill ?? "role-specific evidence";
  const secondaryGap = gaps[1]?.skill ?? primaryGap;

  return [
    {
      day: 1,
      focus: primaryGap,
      task: `Review the JD evidence for ${primaryGap} and write a short explanation of your closest related experience.`,
      outcome: "One resume-ready bullet and one interview talking point.",
    },
    {
      day: 2,
      focus: primaryGap,
      task: `Build or outline a small example that demonstrates ${primaryGap} in the context of the target role.`,
      outcome: "A concrete project example you can discuss.",
    },
    {
      day: 3,
      focus: secondaryGap,
      task: `Study the missing or weaker ${secondaryGap} concepts and connect them to one existing project.`,
      outcome: "A gap explanation that sounds specific rather than generic.",
    },
    {
      day: 4,
      focus: strengths[0]?.skill ?? primaryGap,
      task: "Prepare a concise STAR-style story for the strongest matched skill.",
      outcome: "A 60-second answer grounded in resume evidence.",
    },
    {
      day: 5,
      focus: gaps[2]?.skill ?? "role responsibilities",
      task: "Map each key JD responsibility to either direct evidence, adjacent evidence, or a learning plan.",
      outcome: "A clear strengths/gaps table for interview prep.",
    },
    {
      day: 6,
      focus: "mock interview",
      task: "Practice the generated interview questions aloud and revise weak answers.",
      outcome: "Improved answers for both matched skills and gaps.",
    },
    {
      day: 7,
      focus: "resume alignment",
      task: "Update the resume wording to surface the best matching skills and project evidence.",
      outcome: "A tighter resume version for this JD.",
    },
  ];
}

function buildInterviewQuestions(matchedSkillMatches, missingSkillMatches, resumeSkillMatches) {
  const questions = matchedSkillMatches.slice(0, 4).map((match) => {
    const resumeEvidence = findResumeEvidence(match.skill, resumeSkillMatches);

    return {
      focus: match.skill,
      question: `The JD emphasizes ${match.skill}. Walk me through a project where you used it, including the tradeoff you made and the result.`,
      why_it_matters: resumeEvidence
        ? `Resume evidence to use: ${resumeEvidence}`
        : "The resume mentions this skill, but stronger project evidence would improve the answer.",
    };
  });

  for (const match of missingSkillMatches.slice(0, 2)) {
    questions.push({
      focus: match.skill,
      question: `The JD mentions ${match.skill}, but your resume does not show it clearly. How would you ramp up or transfer adjacent experience?`,
      why_it_matters: `This directly addresses a ${priorityForWeight(match.weight)} priority gap.`,
    });
  }

  if (questions.length === 0) {
    questions.push({
      focus: "role fit",
      question: "Which project best proves you can handle the responsibilities in this JD, and what evidence supports that claim?",
      why_it_matters: "The current text does not expose enough tracked skills, so project evidence becomes the safest interview anchor.",
    });
  }

  return questions;
}

function calculateScore(jobSkillMatches, resumeSkillMatches, matchedSkillMatches) {
  if (jobSkillMatches.length === 0) {
    return {
      score: resumeSkillMatches.length > 0 ? 35 : 0,
      rationale: "No tracked JD skills were detected, so the score is limited until the JD is more specific.",
    };
  }

  const totalWeight = sumWeights(jobSkillMatches);
  const matchedWeight = sumWeights(matchedSkillMatches);
  const coverageRatio = matchedWeight / totalWeight;
  const evidenceRatio =
    matchedSkillMatches.length === 0
      ? 0
      : matchedSkillMatches.filter((match) =>
          findResumeEvidence(match.skill, resumeSkillMatches),
        ).length / matchedSkillMatches.length;
  const score = Math.round(coverageRatio * 80 + evidenceRatio * 20);

  return {
    score,
    rationale: `Weighted skill coverage contributes ${Math.round(coverageRatio * 80)} points and resume evidence quality contributes ${Math.round(evidenceRatio * 20)} points.`,
  };
}

function findSkillMatches(text, sentences) {
  return skillCatalog
    .filter((entry) => entry.patterns.some((pattern) => pattern.test(text)))
    .map((entry) => ({
      skill: entry.skill,
      category: entry.category,
      weight: entry.weight,
      evidence: selectSentences(sentences, entry.patterns, 2),
    }));
}

function selectSentences(sentences, patterns, limit) {
  const matches = sentences.filter((sentence) =>
    patterns.some((pattern) => pattern.test(sentence)),
  );

  return unique(matches).slice(0, limit);
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function summarizeText(value, label) {
  const words = normalizeText(value).split(/\s+/).filter(Boolean);
  const preview = words.slice(0, 32).join(" ");

  if (words.length <= 32) {
    return `${label} received with ${words.length} words: ${preview}`;
  }

  return `${label} received with ${words.length} words: ${preview}...`;
}

function normalizeText(value) {
  return value.trim();
}

function toSkillSummary(match) {
  return {
    skill: match.skill,
    category: match.category,
    evidence: match.evidence,
  };
}

function buildScoreSummary(score, strengths, weaknesses) {
  if (weaknesses.length === 0 && strengths.length > 0) {
    return `Strong match. The resume covers all tracked JD skills with a score of ${score}; focus on presenting concrete project evidence.`;
  }

  if (strengths.length === 0 && weaknesses.length > 0) {
    return `Low match. The JD has ${weaknesses.length} tracked requirements with no matching resume evidence yet; prioritize the highest-weight gaps first.`;
  }

  if (strengths.length === 0 && weaknesses.length === 0) {
    return "Insufficient tracked evidence. Add more specific JD and resume details to produce a meaningful fit analysis.";
  }

  return `Partial match. Strengths include ${strengths.map((item) => item.skill).join(", ")}; key gaps include ${weaknesses.map((item) => item.skill).join(", ")}. Current score is ${score}.`;
}

function recommendationForGap(match, resumeSkillMatches) {
  const adjacentSkill = resumeSkillMatches[0]?.skill;

  if (adjacentSkill) {
    return `Prepare one example that connects your ${adjacentSkill} experience to ${match.skill}, then add direct ${match.skill} evidence if you have it.`;
  }

  return `Create a small practice example for ${match.skill} and add a concise resume bullet only if you can explain the work clearly.`;
}

function findResumeEvidence(skill, resumeSkillMatches) {
  return resumeSkillMatches.find((match) => match.skill === skill)?.evidence[0] ?? "";
}

function priorityForWeight(weight) {
  if (weight >= 5) {
    return "high";
  }

  if (weight >= 3) {
    return "medium";
  }

  return "low";
}

function sumWeights(matches) {
  return matches.reduce((total, match) => total + match.weight, 0);
}

function unique(values) {
  return [...new Set(values)];
}

function firstOrFallback(values, fallback) {
  return values[0] ?? fallback;
}
