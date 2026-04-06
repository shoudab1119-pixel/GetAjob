export function answerFollowupQuestion({ analysis_result, question }) {
  const normalizedQuestion = question.trim().toLowerCase();

  if (asksAboutImprovement(normalizedQuestion)) {
    return {
      answer: buildImprovementAnswer(analysis_result),
    };
  }

  if (asksAboutWeaknesses(normalizedQuestion)) {
    return {
      answer: buildWeaknessAnswer(analysis_result),
    };
  }

  return {
    answer: buildGeneralAnswer(analysis_result, question),
  };
}

function asksAboutWeaknesses(question) {
  return ["weak", "weakness", "gap", "missing", "risk", "缺点", "不足", "差距", "短板"].some(
    (keyword) => question.includes(keyword),
  );
}

function asksAboutImprovement(question) {
  return ["improve", "prepare", "study", "plan", "提升", "改进", "准备", "学习"].some(
    (keyword) => question.includes(keyword),
  );
}

function buildWeaknessAnswer(analysisResult) {
  const matchSummary = analysisResult.match_summary?.summary ?? "No match summary is available.";
  const missingSkills = listValues(analysisResult.match_summary?.missing_skills);
  const gapItems = listGapItems(analysisResult.gap_list);

  if (gapItems.length === 0 && missingSkills.length === 0) {
    return `Based on the current analysis, no specific tracked weakness was found. Match summary: ${matchSummary}`;
  }

  const gapText = gapItems.length > 0 ? gapItems.join(" ") : `Missing skills: ${missingSkills.join(", ")}.`;
  return `Based on the current analysis, the main weaknesses are grounded in the gap list and match summary. Match summary: ${matchSummary} ${gapText}`;
}

function buildImprovementAnswer(analysisResult) {
  const matchSummary = analysisResult.match_summary?.summary ?? "No match summary is available.";
  const gapItems = listGapItems(analysisResult.gap_list);
  const studyItems = listStudyItems(analysisResult.study_plan);
  const questionItems = listInterviewQuestions(analysisResult.interview_questions);

  const gapText =
    gapItems.length > 0 ? `Start with these gaps: ${gapItems.join(" ")}` : "No concrete gap list is available.";
  const studyText =
    studyItems.length > 0
      ? `Use the study plan next: ${studyItems.join(" ")}`
      : "No study plan items are available.";
  const interviewText =
    questionItems.length > 0
      ? `Then practice with: ${questionItems.join(" ")}`
      : "No interview questions are available.";

  return `Match summary: ${matchSummary} ${gapText} ${studyText} ${interviewText}`;
}

function buildGeneralAnswer(analysisResult, question) {
  const score = analysisResult.match_summary?.score;
  const summary = analysisResult.match_summary?.summary ?? "No match summary is available.";
  const gaps = listGapItems(analysisResult.gap_list).slice(0, 2);

  const scoreText = typeof score === "number" ? `The current match score is ${score}.` : "";
  const gapText = gaps.length > 0 ? `Relevant current gaps: ${gaps.join(" ")}` : "";

  return `For your question "${question.trim()}", I can only use the current analysis result. ${scoreText} ${summary} ${gapText}`.trim();
}

function listValues(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : [];
}

function listGapItems(gapList) {
  if (!Array.isArray(gapList)) {
    return [];
  }

  return gapList.map((gap) => {
    if (!gap || typeof gap !== "object") {
      return String(gap);
    }

    const skill = gap.skill ?? "Unknown gap";
    const priority = gap.priority ? `Priority: ${gap.priority}.` : "";
    const reason = gap.reason ? `Reason: ${gap.reason}` : "";
    const recommendation = gap.recommendation ? `Recommendation: ${gap.recommendation}` : "";

    return `${skill}. ${priority} ${reason} ${recommendation}`.trim();
  });
}

function listStudyItems(studyPlan) {
  if (!Array.isArray(studyPlan)) {
    return [];
  }

  return studyPlan.map((item) => {
    if (!item || typeof item !== "object") {
      return String(item);
    }

    const day = item.day ? `Day ${item.day}` : "Study item";
    const focus = item.focus ? `focus on ${item.focus}` : "use the current gap context";
    const task = item.task ? `Task: ${item.task}` : "";

    return `${day}: ${focus}. ${task}`.trim();
  });
}

function listInterviewQuestions(interviewQuestions) {
  if (!Array.isArray(interviewQuestions)) {
    return [];
  }

  return interviewQuestions.map((item) => {
    if (!item || typeof item !== "object") {
      return String(item);
    }

    return item.question ?? JSON.stringify(item);
  });
}
