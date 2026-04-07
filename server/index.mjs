import { createServer } from "node:http";
import { analyzeJobFit } from "./services/analyzeService.mjs";
import { answerFollowupQuestion } from "./services/followupService.mjs";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const maxBodySize = 1_000_000;

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendEmpty(response, statusCode) {
  response.writeHead(statusCode, {
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-origin": "*",
  });
  response.end();
}

async function readJsonBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;

    if (body.length > maxBodySize) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
  }

  if (!body.trim()) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function validateAnalyzeRequest(body) {
  if (typeof body.job_description !== "string" || !body.job_description.trim()) {
    return "Field `job_description` is required and must be a non-empty string.";
  }

  if (typeof body.resume !== "string" || !body.resume.trim()) {
    return "Field `resume` is required and must be a non-empty string.";
  }

  return "";
}

function validateFollowupRequest(body) {
  if (!body.analysis_result || typeof body.analysis_result !== "object" || Array.isArray(body.analysis_result)) {
    return "Field `analysis_result` is required and must be an object.";
  }

  if (typeof body.question !== "string" || !body.question.trim()) {
    return "Field `question` is required and must be a non-empty string.";
  }

  return "";
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "OPTIONS") {
    sendEmpty(response, 204);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, {
      service: "job-agent-server",
      status: "ok",
      milestone: 7,
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/analyze") {
    try {
      const body = await readJsonBody(request);
      const validationError = validateAnalyzeRequest(body);

      if (validationError) {
        sendJson(response, 400, {
          error: {
            code: "invalid_request",
            message: validationError,
          },
        });
        return;
      }

      sendJson(response, 200, analyzeJobFit(body));
    } catch (error) {
      const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
      const message =
        statusCode === 500 ? "Analyze request failed." : error.message;

      sendJson(response, statusCode, {
        error: {
          code: statusCode === 413 ? "payload_too_large" : "invalid_request",
          message,
        },
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/followup") {
    try {
      const body = await readJsonBody(request);
      const validationError = validateFollowupRequest(body);

      if (validationError) {
        sendJson(response, 400, {
          error: {
            code: "invalid_request",
            message: validationError,
          },
        });
        return;
      }

      sendJson(response, 200, answerFollowupQuestion(body));
    } catch (error) {
      const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
      const message = statusCode === 500 ? "Follow-up request failed." : error.message;

      sendJson(response, statusCode, {
        error: {
          code: statusCode === 413 ? "payload_too_large" : "invalid_request",
          message,
        },
      });
    }
    return;
  }

  sendJson(response, 404, {
    error: {
      code: "not_found",
      message: "Endpoint is not available.",
    },
  });
});

server.listen(port, () => {
  console.log(`Job Agent placeholder server running at http://localhost:${port}`);
});
