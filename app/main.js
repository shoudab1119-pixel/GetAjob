import { parseTextUpload } from "./fileParser.js";

const form = document.querySelector("#analysis-form");
const jobDescriptionInput = document.querySelector("#job-description");
const jobDescriptionFileInput = document.querySelector("#job-description-file");
const jobDescriptionFileStatus = document.querySelector("#job-description-file-status");
const resumeInput = document.querySelector("#resume");
const resumeFileInput = document.querySelector("#resume-file");
const resumeFileStatus = document.querySelector("#resume-file-status");
const submitButton = document.querySelector("#submit-button");
const loadingState = document.querySelector("#loading-state");
const errorState = document.querySelector("#error-state");
const emptyState = document.querySelector("#empty-state");
const resultSections = document.querySelector("#result-sections");
const followupForm = document.querySelector("#followup-form");
const followupQuestionInput = document.querySelector("#followup-question");
const followupButton = document.querySelector("#followup-button");
const followupLoadingState = document.querySelector("#followup-loading-state");
const followupErrorState = document.querySelector("#followup-error-state");
const followupAnswer = document.querySelector("#followup-answer");
const apiBaseUrl = "http://localhost:3000";
let currentAnalysisResult = null;

const sectionLabels = {
  requirements: "Job requirements summary",
  resume_summary: "Resume summary",
  match_summary: "Match analysis",
  gap_list: "Gap list",
  study_plan: "Study plan",
  interview_questions: "Interview questions",
};

function setLoading(isLoading) {
  loadingState.hidden = !isLoading;
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Analyzing..." : "Analyze fit";
}

function setFollowupLoading(isLoading) {
  followupLoadingState.hidden = !isLoading;
  followupButton.disabled = isLoading;
  followupButton.textContent = isLoading ? "Answering..." : "Ask follow-up";
}

function showError(message) {
  errorState.textContent = message;
  errorState.hidden = false;
}

function clearError() {
  errorState.textContent = "";
  errorState.hidden = true;
}

function showFollowupError(message) {
  followupErrorState.textContent = message;
  followupErrorState.hidden = false;
}

function clearFollowupState() {
  followupErrorState.textContent = "";
  followupErrorState.hidden = true;
  followupAnswer.textContent = "";
  followupAnswer.hidden = true;
}

function resetAnalysisState() {
  resultSections.hidden = true;
  emptyState.hidden = false;
  followupForm.hidden = true;
  currentAnalysisResult = null;
  clearFollowupState();
}

function showFileStatus(statusElement, message, type) {
  statusElement.textContent = message;
  statusElement.dataset.type = type;
  statusElement.hidden = false;
}

function clearFileStatus(statusElement) {
  statusElement.textContent = "";
  statusElement.removeAttribute("data-type");
  statusElement.hidden = true;
}

async function handleFileInput({ fileInput, textInput, statusElement, label }) {
  clearError();
  clearFileStatus(statusElement);

  const file = fileInput.files?.[0];

  if (!file) {
    return;
  }

  try {
    textInput.value = await parseTextUpload(file);
    resetAnalysisState();
    showFileStatus(statusElement, `${label} loaded from ${file.name}.`, "success");
  } catch (error) {
    fileInput.value = "";
    showFileStatus(statusElement, error.message, "error");
  }
}

function renderResult(result) {
  resultSections.replaceChildren();

  for (const [key, label] of Object.entries(sectionLabels)) {
    const card = document.createElement("section");
    const heading = document.createElement("h3");

    card.className = "result-card";
    heading.textContent = label;

    card.append(heading, renderValue(result[key]));
    resultSections.append(card);
  }

  emptyState.hidden = true;
  resultSections.hidden = false;
  currentAnalysisResult = result;
  followupForm.hidden = false;
  clearFollowupState();
}

function renderValue(value) {
  if (Array.isArray(value)) {
    const list = document.createElement("ul");

    for (const item of value) {
      const listItem = document.createElement("li");
      listItem.append(renderValue(item));
      list.append(listItem);
    }

    return list;
  }

  if (value && typeof value === "object") {
    const list = document.createElement("dl");

    for (const [key, nestedValue] of Object.entries(value)) {
      const term = document.createElement("dt");
      const description = document.createElement("dd");

      term.textContent = formatLabel(key);
      description.append(renderValue(nestedValue));
      list.append(term, description);
    }

    return list;
  }

  const span = document.createElement("span");
  span.textContent = String(value ?? "");
  return span;
}

function formatLabel(value) {
  return value.replaceAll("_", " ");
}

async function requestAnalysis({ jobDescription, resume }) {
  const response = await fetch(`${apiBaseUrl}/api/analyze`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      job_description: jobDescription,
      resume,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Analyze request failed.");
  }

  return payload;
}

async function requestFollowup({ analysisResult, question }) {
  const response = await fetch(`${apiBaseUrl}/api/followup`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      analysis_result: analysisResult,
      question,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Follow-up request failed.");
  }

  return payload;
}

function validateInputs(jobDescription, resume) {
  if (!jobDescription.trim() || !resume.trim()) {
    return "Please provide both a job description and a resume.";
  }

  return "";
}

function validateFollowupInput(question) {
  if (!currentAnalysisResult) {
    return "Run an analysis before asking a follow-up question.";
  }

  if (!question.trim()) {
    return "Please enter a follow-up question.";
  }

  return "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const jobDescription = jobDescriptionInput.value;
  const resume = resumeInput.value;
  const validationError = validateInputs(jobDescription, resume);

  clearError();

  if (validationError) {
    resultSections.hidden = true;
    emptyState.hidden = false;
    followupForm.hidden = true;
    currentAnalysisResult = null;
    clearFollowupState();
    showError(validationError);
    return;
  }

  setLoading(true);
  resultSections.hidden = true;
  followupForm.hidden = true;
  currentAnalysisResult = null;
  clearFollowupState();

  try {
    renderResult(await requestAnalysis({ jobDescription, resume }));
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
});

jobDescriptionFileInput.addEventListener("change", () => {
  handleFileInput({
    fileInput: jobDescriptionFileInput,
    textInput: jobDescriptionInput,
    statusElement: jobDescriptionFileStatus,
    label: "Job description",
  });
});

resumeFileInput.addEventListener("change", () => {
  handleFileInput({
    fileInput: resumeFileInput,
    textInput: resumeInput,
    statusElement: resumeFileStatus,
    label: "Resume",
  });
});

followupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = followupQuestionInput.value;
  const validationError = validateFollowupInput(question);

  clearFollowupState();

  if (validationError) {
    showFollowupError(validationError);
    return;
  }

  setFollowupLoading(true);

  try {
    const response = await requestFollowup({
      analysisResult: currentAnalysisResult,
      question,
    });

    followupAnswer.textContent = response.answer;
    followupAnswer.hidden = false;
  } catch (error) {
    showFollowupError(error.message);
  } finally {
    setFollowupLoading(false);
  }
});
