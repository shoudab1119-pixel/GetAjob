const supportedExtensions = new Set([".txt", ".md", ".json"]);

export class FileParseError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "FileParseError";
    this.code = code;
  }
}

export async function parseTextUpload(file) {
  if (!file) {
    throw new FileParseError("missing_file", "Please choose a file.");
  }

  const extension = getFileExtension(file.name);

  if (!supportedExtensions.has(extension)) {
    throw new FileParseError(
      "unsupported_file_type",
      "Unsupported file type. Please upload a .txt, .md, or .json file.",
    );
  }

  let rawText;

  try {
    rawText = await file.text();
  } catch {
    throw new FileParseError("parse_failed", "Could not read the uploaded file.");
  }

  if (!rawText.trim()) {
    throw new FileParseError("empty_file", "Uploaded file is empty.");
  }

  if (extension === ".json") {
    return parseJsonText(rawText);
  }

  return rawText.trim();
}

function parseJsonText(rawText) {
  try {
    const parsed = JSON.parse(rawText);
    const text = extractJsonText(parsed).trim();

    if (!text) {
      throw new FileParseError("empty_file", "Uploaded JSON file does not contain text content.");
    }

    return text;
  } catch (error) {
    if (error instanceof FileParseError) {
      throw error;
    }

    throw new FileParseError("parse_failed", "Uploaded JSON file could not be parsed.");
  }
}

function extractJsonText(value) {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value ?? "");
}

function getFileExtension(fileName) {
  const normalizedName = fileName.toLowerCase();
  const dotIndex = normalizedName.lastIndexOf(".");

  if (dotIndex === -1) {
    return "";
  }

  return normalizedName.slice(dotIndex);
}
