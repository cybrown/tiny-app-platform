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
}: {
  method: string;
  url: string;
  headers?: [string, string][];
  elements: { [key: string]: { sourceKind: 'string' | 'file'; value: string } };
  allowErrorStatusCode?: boolean;
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
  stage: 'pending' | 'fulfilled';
};

async function http_request_impl(
  ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  const requestConfiguration = {
    method: value.method ?? 'get',
    url: value.url,
    headers: value.headers,
    ...(value.body ? { body: value.body } : {}),
  };
  const logItem = ctx.log('http-request', {
    request: requestConfiguration,
    stage: 'pending',
    response: null,
  } as HttpLogItemData);
  const response = await httpRequest(requestConfiguration);
  logItem.data.stage = 'fulfilled';
  logItem.data.response = {
    status: response.status,
    headers: response.headers,
    body: response.body,
  };
  if (
    !value.allowErrorStatusCode &&
    (response.status < 200 || response.status >= 400)
  ) {
    throw new Error('HTTP Request failed with status: ' + response.status);
  }
  return response;
}

async function httpRequest({
  method,
  headers,
  url,
  body,
}: {
  method: string;
  url: string;
  headers?: [string, string][];
  body?: unknown;
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
      ] as [string, string][])
  );
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
