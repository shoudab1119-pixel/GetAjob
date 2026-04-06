import { createServer } from "node:http";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, {
      service: "job-agent-server",
      status: "ok",
      milestone: 1,
    });
    return;
  }

  sendJson(response, 404, {
    error: {
      code: "not_found",
      message: "Endpoint is not available in Milestone 1.",
    },
  });
});

server.listen(port, () => {
  console.log(`Job Agent placeholder server running at http://localhost:${port}`);
});
