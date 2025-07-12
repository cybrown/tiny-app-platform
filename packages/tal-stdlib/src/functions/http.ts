import { customRpc } from '../util/custom-rpc';
import { defineFunction, RuntimeContext } from 'tal-eval';

export const http_request = defineFunction(
  'http_request',
  [
    { name: 'method' },
    { name: 'url' },
    { name: 'headers' },
    { name: 'body' },
    { name: 'allowErrorStatusCode' },
    { name: 'insecure' },
  ],
  undefined,
  http_request_impl,
  {
    description: 'Perform an HTTP request with full configuration and logging',
    parameters: {
      method: 'HTTP method (get, post, etc.)',
      url: 'Request URL',
      headers: 'Array of [name, value] header pairs',
      body: 'Request body payload',
      allowErrorStatusCode: 'Whether non-2xx status codes are allowed',
      insecure: 'Whether to allow insecure TLS',
    },
    returns: 'Response object with status, headers, and body',
  }
);

export const http = defineFunction(
  'http',
  [
    { name: 'url' },
    { name: 'body' },
    { name: 'headers', onlyNamed: true },
    { name: 'allowErrorStatusCode', onlyNamed: true },
    { name: 'insecure', onlyNamed: true },
    { name: 'method', onlyNamed: true },
    { name: 'get', onlyNamed: true },
    { name: 'post', onlyNamed: true },
    { name: 'put', onlyNamed: true },
    { name: 'delete', onlyNamed: true },
    { name: 'patch', onlyNamed: true },
    { name: 'head', onlyNamed: true },
  ],
  undefined,
  http_impl,
  {
    description:
      'Simplified HTTP helper supporting named parameters and shorthand methods',
    parameters: {
      url: 'Request URL',
      body: 'Request body payload',
      headers: 'Array of [name, value] header pairs',
      allowErrorStatusCode: 'Whether non-2xx status codes are allowed',
      insecure: 'Whether to allow insecure TLS',
      method: 'Explicit HTTP method',
      get: 'Shorthand for GET method',
      post: 'Shorthand for POST method',
      put: 'Shorthand for PUT method',
      delete: 'Shorthand for DELETE method',
      patch: 'Shorthand for PATCH method',
      head: 'Shorthand for HEAD method',
    },
    returns: 'Response object with status, headers, and body',
  }
);

export const http_request_form = defineFunction(
  'http_request_form',
  [
    { name: 'method' },
    { name: 'url' },
    { name: 'headers' },
    { name: 'elements' },
    { name: 'allowErrorStatusCode' },
    { name: 'insecure' },
  ],
  undefined,
  http_request_form_impl,
  {
    description: 'Submit multipart form data via HTTP and handle errors',
    parameters: {
      method: 'HTTP method (get, post, etc.)',
      url: 'Endpoint URL',
      headers: 'Array of [name, value] header pairs',
      elements: 'Form elements as { [key]: { sourceKind, value } }',
      allowErrorStatusCode: 'Whether non-2xx status codes are allowed',
      insecure: 'Whether to allow insecure TLS',
    },
    returns: 'Response with status, headers, and body as bytes',
  }
);

async function http_request_form_impl(
  _ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  const response = await httpRequestFormData({
    method: (value.method as string) ?? 'get',
    url: value.url as string,
    headers: value.headers as [string, string][],
    elements: value.elements as {
      [key: string]: any;
    },
    insecure: value.insecure,
  });
  if (
    !value.allowErrorStatusCode &&
    (response.status < 200 || response.status >= 400)
  ) {
    throw new Error('HTTP Request failed with status: ' + response.status);
  }
  return response;
}

async function httpRequestFormData({
  method,
  headers,
  url,
  elements,
  allowErrorStatusCode,
  insecure,
}: {
  method: string;
  url: string;
  headers?: [string, string][];
  elements: { [key: string]: { sourceKind: 'string' | 'file'; value: string } };
  allowErrorStatusCode?: boolean;
  insecure?: boolean;
}) {
  var response = await customRpc(
    'http-request-form-data',
    elements,
    (headers ?? [])
      .map(
        ([name, value]) => ['X-fetch-header-' + name, value] as [string, string]
      )
      .concat([
        ['X-fetch-method', method],
        ['X-fetch-url', url],
        ...(insecure ? [['X-fetch-insecure', insecure]] : []),
      ] as [string, string][])
  );
  if (
    !allowErrorStatusCode &&
    (response.status < 200 || response.status >= 400)
  ) {
    throw new Error('HTTP Request failed with status: ' + response.status);
  }
  return {
    status: response.status,
    // TODO: Allow one header to have multiple values
    headers: Object.fromEntries(
      (() => {
        const headers: [string, string][] = [];
        response.headers.forEach((value, key) => headers.push([key, value]));
        return headers;
      })()
    ),
    body: await response.arrayBuffer(),
  };
}

export type HttpLogItemData = {
  request: {
    method: string;
    url: string;
    headers: [string, string][];
    body: any;
  };
  response: {
    status: number;
    headers: Record<string, string>;
    body: any;
  } | null;
  stage: 'pending' | 'fulfilled' | 'rejected';
};

class HttpErrorStatus extends Error {}

async function http_request_impl(
  ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  const requestConfiguration = {
    method: value.method ?? 'get',
    url: value.url,
    headers: value.headers,
    ...(value.body ? { body: value.body } : {}),
    insecure: value.insecure,
  };
  const logItem = ctx.log('http-request', {
    request: requestConfiguration,
    stage: 'pending',
    response: null,
  } as HttpLogItemData);
  try {
    const response = await httpRequest(requestConfiguration);
    logItem.data.stage = 'fulfilled';
    logItem.data.response = {
      status: response.status,
      headers: response.headers,
      body: response.body,
    };
    if (response.status === 0) {
      throw new Error(
        'HTTP Request failed: Internal error, check backend logs'
      );
    }
    if (
      !value.allowErrorStatusCode &&
      (response.status < 200 || response.status >= 400)
    ) {
      throw new HttpErrorStatus(
        'HTTP Request failed with status: ' + response.status
      );
    }
    return response;
  } catch (e) {
    if (!(e instanceof HttpErrorStatus)) {
      logItem.data.stage = 'rejected';
    }
    throw e;
  }
}

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head'];

async function http_impl(ctx: RuntimeContext, value: { [key: string]: any }) {
  let method: string | null = value.method ?? null;

  HTTP_METHODS.forEach((methodName) => {
    if (value[methodName]) {
      if (method != null) {
        throw new Error('Only one method is expected for http function');
      }
      method = methodName;
    }
  });

  const requestConfiguration = {
    method: method ?? (value.body ? 'post' : 'get'),
    url: value.url,
    headers: value.headers,
    ...(value.body ? { body: value.body } : {}),
    insecure: value.insecure,
  };
  const logItem = ctx.log('http-request', {
    request: requestConfiguration,
    stage: 'pending',
    response: null,
  } as HttpLogItemData);
  try {
    const response = await httpRequest(requestConfiguration);
    logItem.data.stage = 'fulfilled';
    logItem.data.response = {
      status: response.status,
      headers: response.headers,
      body: response.body,
    };
    if (response.status === 0) {
      throw new Error(
        'HTTP Request failed: Internal error, check backend logs'
      );
    }
    if (
      !value.allowErrorStatusCode &&
      (response.status < 200 || response.status >= 400)
    ) {
      throw new HttpErrorStatus(
        'HTTP Request failed with status: ' + response.status
      );
    }
    return response;
  } catch (e) {
    if (!(e instanceof HttpErrorStatus)) {
      logItem.data.stage = 'rejected';
    }
    throw e;
  }
}

const HEADER_PREFIX = 'x-fetch-header-';

async function httpRequest({
  method,
  headers,
  url,
  body,
  insecure,
}: {
  method: string;
  url: string;
  headers?: [string, string][];
  body?: unknown;
  insecure?: boolean;
}) {
  var response = await customRpc(
    'fetch',
    body,
    (headers ?? [])
      .map(
        ([name, value]) => ['X-fetch-header-' + name, value] as [string, string]
      )
      .concat([
        ['X-fetch-method', method],
        ['X-fetch-url', url],
        ...(insecure ? [['X-fetch-insecure', insecure]] : []),
      ] as [string, string][])
  );
  return {
    status: Number(response.headers.get('x-fetch-status-code') ?? 0),
    headers: Object.fromEntries(
      (() => {
        const headers: [string, string][] = [];
        response.headers.forEach((value, key) => {
          if (key.startsWith(HEADER_PREFIX)) {
            headers.push([key.slice(HEADER_PREFIX.length), value]);
          }
        });
        return headers;
      })()
    ),
    body: await response.arrayBuffer(),
  };
}
