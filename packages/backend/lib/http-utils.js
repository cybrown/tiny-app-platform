const Route = require("route-parser");

function readAllRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("close", () => {
      const bodyString = Buffer.concat(chunks).toString();
      const bodyJson = JSON.parse(bodyString);
      resolve(bodyJson);
    });
  });
}

function createResponse(status, headers, body) {
  return { status, headers, body };
}

function okJson(body) {
  return createResponse(
    200,
    { "Content-Type": "application/json" },
    JSON.stringify(body)
  );
}

function okText(body) {
  return createResponse(200, { "Content-Type": "text/plain" }, body);
}

function notFound() {
  return createResponse(404);
}

function noContent() {
  return createResponse(204);
}

function sendResponse(res, response) {
  if (response.status) {
    res.statusCode = response.status;
  }

  if (response.headers) {
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }

  if (response.body !== undefined) {
    res.write(response.body);
  }
  res.end();
}

const superHandler = (routes) => {
  const compiledRoutes = routes.map((routeDefinition) => {
    var compiledRoute = new Route(routeDefinition.route);
    return { ...routeDefinition, compiledRoute };
  });

  return async (req, res) => {
    console.log(req.url);

    let routeFound = false;
    for (let routeDefinition of compiledRoutes) {
      const matching = routeDefinition.compiledRoute.match(req.url);
      if (matching) {
        routeFound = true;
        try {
          sendResponse(res, await routeDefinition.handler(req, matching));
        } catch (err) {
          console.error(err);
          sendResponse(
            res,
            createResponse(500, [], JSON.stringify({ message: err.message }))
          );
        }
        break;
      }
    }
    if (!routeFound) {
      sendResponse(res, { status: 404 });
    }
  };
};

function readBody(req) {
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

module.exports = {
  readAllRequestBody,
  okJson,
  okText,
  noContent,
  notFound,
  createResponse,
  sendResponse,
  superHandler,
  readBody,
};
