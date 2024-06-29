const staticFiles = ["/static/", "/fonts/"];

function log(...args) {
  console.log("[SW]", ...args);
}

self.addEventListener("install", async (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", async (event) => {
  log("activate");
  event.waitUntil(
    caches
      .delete("v1")
      .then(() => {
        log("Cache deleted during activate");
      })
      .catch((err) => {
        log("Failed to delete cache during activate event", err);
      })
  );
});

async function cachePut(cacheKey, response) {
  log("Cache put", cacheKey);
  const cache = await caches.open("v1");
  await cache.put(cacheKey, response);
}

const PATHNAME_TO_APP = /^\/[a-zA-Z0-9-_]*$/;

/**
 * Is a given URL an index.html path?
 */
function isMutableResource(url) {
  const pathname = new URL(url).pathname;
  return pathname === "/configuration" || isIndexHtmlPath(url);
}

/**
 * Is a given URL an index.html path?
 */
function isIndexHtmlPath(url) {
  const pathname = new URL(url).pathname;
  return pathname !== "/configuration" && PATHNAME_TO_APP.test(pathname);
}

/**
 * Is a given URL an immutable asset?
 */
function isStaticImmutableAsset(url) {
  const pathname = new URL(url).pathname;
  return staticFiles.find((p) => pathname.startsWith(p));
}

function fetchMutableResource(cacheKey, request) {
  return fetch(request).then((response) => {
    if (response.status !== 200) {
      return response;
    }
    const headers = new Headers(response.headers);
    headers.set("SW-Timed-Cache", String(Date.now()));
    const responseToCache = new Response(response.clone().body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
    cachePut(cacheKey, responseToCache);
    return response;
  });
}

const CACHE_MAX_AGE_MS = 1000 * 60 * 60; // 1 hour

self.addEventListener("fetch", async (event) => {
  if (event.request.method !== "GET") {
    event.respondWith(fetch(event.request));
    return;
  }
  const origin = new URL(event.request.url).origin;
  if (origin !== location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  /**
   * Strategy for mutable resource:
   * - Try to find the mutable resource in the cache
   * - If not found, fetch it and cache it on success
   * - If found and not too old, return it
   * - If found but too old, return it and in background, refetch and update the cache on success
   */
  if (isMutableResource(event.request.url)) {
    const cacheKey = isIndexHtmlPath(event.request.url)
      ? location.origin + "/"
      : event.request.url;
    event.respondWith(
      caches.match(cacheKey, { ignoreSearch: true }).then((response) => {
        if (!response) {
          return fetchMutableResource(cacheKey, event.request);
        }

        // If the cache is too old, refetch it, update the cache and return the original response
        if (
          Date.now() - Number(response.headers.get("SW-Timed-Cache")) >
          CACHE_MAX_AGE_MS
        ) {
          log("Cache update", cacheKey);
          fetchMutableResource(cacheKey, event.request)
            .then(() => {
              log("Cache updated", cacheKey);
              // TODO: Notify app that an update is available ?
            })
            .catch((err) => {
              // TODO: Notify app that an update failed ?
            });
        }

        return response;
      })
    );
    return;
  }

  /**
   * Strategy for static immutable assets:
   * - Try to find the asset in the cache
   * - If not found, fetch it and cache it on success
   * - If found, return it
   */
  if (isStaticImmutableAsset(event.request.url)) {
    event.respondWith(
      caches.match(event.request.url).then((response) => {
        if (!response) {
          return fetch(event.request).then((response) => {
            if (response.status === 200) {
              cachePut(event.request.url, response.clone());
            }
            return response;
          });
        }
        return response;
      })
    );
    return;
  }

  event.respondWith(fetch(event.request));
});
