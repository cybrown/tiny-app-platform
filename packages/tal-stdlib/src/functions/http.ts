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
  http_request_impl
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
  http_request_form_impl
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
    // TODO: Allow one header to have multiple values
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
