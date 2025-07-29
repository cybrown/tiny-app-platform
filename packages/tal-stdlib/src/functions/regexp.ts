import {
  defineFunction3,
  typeArray,
  typeBoolean,
  typeFunction,
  typeNull,
  typeString,
  typeUnion,
} from 'tal-eval';

let COMMON_PARAMETERS = {
  str: 'The string to search in',
  regexp: 'The regular expression to search for',
  ignoreCase: 'Whether to ignore case (default: false)',
  multiline: 'Whether to treat the string as multiline (default: false)',
};

export const regexp_find = defineFunction3(
  'regexp_find',
  [
    { name: 'str' },
    { name: 'regexp' },
    { name: 'ignoreCase' },
    { name: 'multiline' },
  ],
  typeFunction(
    [
      { name: 'str', type: typeString() },
      { name: 'regexp', type: typeString() },
      { name: 'ignoreCase', type: typeUnion(typeNull(), typeBoolean()) },
      { name: 'multiline', type: typeUnion(typeNull(), typeBoolean()) },
    ],
    [],
    typeUnion(typeNull(), typeString())
  ),
  (_ctx, { regexp, str, ignoreCase, multiline }) => {
    const r = buildRegExp(regexp, false, ignoreCase, multiline);
    const match = str.match(r);
    return match ? getWholeMatch(match) : null;
  },
  undefined,
  {
    description: 'Find the first match of a regular expression in a string',
    parameters: COMMON_PARAMETERS,
    returns:
      'The first match of the regular expression in the string, or null if no match is found',
  }
);

export const regexp_find_global = defineFunction3(
  'regexp_find_global',
  [
    { name: 'str' },
    { name: 'regexp' },
    { name: 'ignoreCase' },
    { name: 'multiline' },
  ],
  typeFunction(
    [
      { name: 'str', type: typeString() },
      { name: 'regexp', type: typeString() },
      { name: 'ignoreCase', type: typeUnion(typeNull(), typeBoolean()) },
      { name: 'multiline', type: typeUnion(typeNull(), typeBoolean()) },
    ],
    [],
    typeArray(typeString())
  ),
  (_ctx, { regexp, str, ignoreCase, multiline }) => {
    const r = buildRegExp(regexp, true, ignoreCase, multiline);
    return [...(str.matchAll(r) ?? [])].map(getWholeMatch);
  },
  undefined,
  {
    description: 'Find all matches of a regular expression in a string',
    parameters: COMMON_PARAMETERS,
    returns:
      'An array of all matches of the regular expression in the string, or an empty array if no matches are found',
  }
);

export const regexp_find_groups = defineFunction3(
  'regexp_find_groups',
  [
    { name: 'str' },
    { name: 'regexp' },
    { name: 'ignoreCase' },
    { name: 'multiline' },
  ],
  typeFunction(
    [
      { name: 'str', type: typeString() },
      { name: 'regexp', type: typeString() },
      { name: 'ignoreCase', type: typeUnion(typeNull(), typeBoolean()) },
      { name: 'multiline', type: typeUnion(typeNull(), typeBoolean()) },
    ],
    [],
    typeUnion(typeNull(), typeArray(typeString()))
  ),
  (_ctx, { regexp, str, ignoreCase, multiline }) => {
    const r = buildRegExp(regexp, false, ignoreCase, multiline);
    const match = str.match(r);
    return match ? getGroups(match) : null;
  },
  undefined,
  {
    description:
      'Find the first match of a regular expression in a string and return its groups',
    parameters: COMMON_PARAMETERS,
    returns:
      'An array of matches with the groups of the regular expression in the string, or null if no match is found',
  }
);

export const regexp_find_groups_global = defineFunction3(
  'regexp_find_groups_global',
  [
    { name: 'str' },
    { name: 'regexp' },
    { name: 'ignoreCase' },
    { name: 'multiline' },
  ],
  typeFunction(
    [
      { name: 'str', type: typeString() },
      { name: 'regexp', type: typeString() },
      { name: 'ignoreCase', type: typeUnion(typeNull(), typeBoolean()) },
      { name: 'multiline', type: typeUnion(typeNull(), typeBoolean()) },
    ],
    [],
    typeArray(typeArray(typeString()))
  ),
  (_ctx, { regexp, str, ignoreCase, multiline }) => {
    const r = buildRegExp(regexp, true, ignoreCase, multiline);
    return [...(str.matchAll(r) ?? [])].map(getGroups);
  },
  undefined,
  {
    description:
      'Find all matches of a regular expression in a string and return their groups',
    parameters: COMMON_PARAMETERS,
    returns:
      'An array of all matches with their groups of the regular expression in the string, or null if no match is found',
  }
);

export const regexp_test = defineFunction3(
  'regexp_test',
  [
    { name: 'str' },
    { name: 'regexp' },
    { name: 'multiline' },
    { name: 'ignoreCase' },
  ],
  typeFunction(
    [
      { name: 'str', type: typeString() },
      { name: 'regexp', type: typeString() },
      { name: 'ignoreCase', type: typeUnion(typeNull(), typeBoolean()) },
      { name: 'multiline', type: typeUnion(typeNull(), typeBoolean()) },
    ],
    [],
    typeBoolean()
  ),
  (_ctx, { regexp, str, ignoreCase, multiline }) => {
    const r = buildRegExp('^.*' + regexp + '.*$', false, ignoreCase, multiline);
    return r.test(str);
  },
  undefined,
  {
    description: 'Test if a regular expression matches a string',
    parameters: {
      str: 'The string to search in',
      regexp: 'The regular expression to search for',
      ignoreCase: 'Whether to ignore case (default: false)',
      multiline: 'Whether to treat the string as multiline (default: false)',
    },
    returns:
      'True if the regular expression matches the string, false otherwise',
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
