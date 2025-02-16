import Route from "route-parser";
import config from "./config.mjs";

export function createResponse(status, headers, body) {
  return { status, headers, body };
}

export function okJson(body) {
  return createResponse(
    200,
    { "Content-Type": "application/json" },
    JSON.stringify(body)
  );
}

export function okText(body, headers) {
  return createResponse(
    200,
    { "Content-Type": "text/plain", ...headers },
    body
  );
}

export function okBytes(body) {
  return createResponse(
    200,
    { "Content-Type": "application/octet-stream" },
    body
  );
}

export function notFound() {
  return createResponse(404);
}

export function noContent() {
  return createResponse(204);
}

export function sendResponse(res, response) {
  if (response.status) {
    res.statusCode = response.status;
  }

  if (response.headers) {
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }

  if (response.body !== undefined) {
    const responseBody = Buffer.from(response.body);
    res.setHeader("Content-Length", responseBody.length);
    res.write(responseBody);
  } else {
    res.setHeader("Content-Length", 0);
  }

  res.end();
}

export const superHandler = (routes, defaultHandler) => {
  const compiledRoutes = routes.map((routeDefinition) => {
    var compiledRoute = new Route(routeDefinition.route);
    return { ...routeDefinition, compiledRoute };
  });

  return async (req, res) => {
    let routeFound = false;
    for (let routeDefinition of compiledRoutes) {
      const matching = routeDefinition.compiledRoute.match(req.url);
      if (matching) {
        routeFound = true;
        try {
          const answer = await routeDefinition.handler(req, matching);
          if (typeof answer == "function") {
            await answer(res);
          } else {
            sendResponse(res, answer);
          }
        } catch (err) {
          config.log && console.error(err);
          sendResponse(
            res,
            createResponse(500, [], JSON.stringify({ message: err.message }))
          );
        }
        break;
      }
    }
    if (!routeFound) {
      if (!defaultHandler) {
        sendResponse(res, { status: 404 });
      } else {
        defaultHandler(req, res);
      }
    }
  };
};

export function readBody(req) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    req.on("data", (data) => buffers.push(data));
    req.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
}
