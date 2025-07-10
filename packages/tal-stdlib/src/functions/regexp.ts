import { defineFunction } from 'tal-eval';

export const regexp_find = defineFunction(
  'regexp_find',
  [
    { name: 'str' },
    { name: 'regexp' },
    { name: 'ignoreCase' },
    { name: 'multiline' },
  ],
  (_ctx, { regexp, str, ignoreCase, multiline }) => {
    const r = buildRegExp(regexp, false, ignoreCase, multiline);
    const match = str.match(r);
    return match ? getWholeMatch(match) : null;
  }
);

export const regexp_find_global = defineFunction(
  'regexp_find_global',
  [
    { name: 'str' },
    { name: 'regexp' },
    { name: 'ignoreCase' },
    { name: 'multiline' },
  ],
  (_ctx, { regexp, str, ignoreCase, multiline }) => {
    const r = buildRegExp(regexp, true, ignoreCase, multiline);
    return [...(str.matchAll(r) ?? [])].map(getWholeMatch);
  }
);

export const regexp_find_groups = defineFunction(
  'regexp_find_groups',
  [
    { name: 'str' },
    { name: 'regexp' },
    { name: 'ignoreCase' },
    { name: 'multiline' },
  ],
  (_ctx, { regexp, str, ignoreCase, multiline }) => {
    const r = buildRegExp(regexp, false, ignoreCase, multiline);
    const match = str.match(r);
    return match ? getGroups(match) : null;
  }
);

export const regexp_find_groups_global = defineFunction(
  'regexp_find_groups_global',
  [
    { name: 'str' },
    { name: 'regexp' },
    { name: 'ignoreCase' },
    { name: 'multiline' },
  ],
  (_ctx, { regexp, str, ignoreCase, multiline }) => {
    const r = buildRegExp(regexp, true, ignoreCase, multiline);
    return [...(str.matchAll(r) ?? [])].map(getGroups);
  }
);

export const regexp_test = defineFunction(
  'regexp_test',
  [
    { name: 'str' },
    { name: 'regexp' },
    { name: 'multiline' },
    { name: 'ignoreCase' },
  ],
  (_ctx, { regexp, str, ignoreCase }) => {
    const r = buildRegExp('^.*' + regexp + '.*$', true, ignoreCase, true);
    return r.test(str);
  }
);

function getWholeMatch(matchResult: ReturnType<String['match']>) {
  if (matchResult === null) {
    return null;
  }
  return matchResult[0];
}

function getGroups(matchResult: ReturnType<String['match']>) {
  if (matchResult === null) {
    return null;
  }
  return matchResult.slice();
}

function buildFlags(
  global: boolean,
  ignoreCase: boolean,
  multiline: boolean
): string {
  return [global ? 'g' : '', ignoreCase ? 'i' : '', multiline ? 'm' : ''].join(
    ''
  );
}

let REGEXP_CACHE: Map<string, RegExp> = new Map();

function buildRegExp(
  regexp: string,
  global: boolean,
  ignoreCase: boolean,
  multiline: boolean
): RegExp {
  const cacheKey = `${regexp}#${global}${ignoreCase}${multiline}`;
  if (!REGEXP_CACHE.has(cacheKey)) {
    const result = new RegExp(
      regexp,
      buildFlags(global, ignoreCase, multiline)
    );
    REGEXP_CACHE.set(cacheKey, result);
    return result;
  }
  return REGEXP_CACHE.get(cacheKey)!;
}
