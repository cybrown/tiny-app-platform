import { defineFunction, RuntimeContext } from 'tal-eval';
import { base64_to_bytes } from '../util/base64';

export const string_to_bytes = defineFunction(
  'string_to_bytes',
  [{ name: 'string' }, { name: 'encoding' }],
  (_ctx, { string, encoding }) => {
    const pEncoding = encoding ?? 'utf-8';
    switch (pEncoding) {
      case 'base64':
        return base64_to_bytes(string);
      case 'base64url':
        return base64_to_bytes(string);
      case 'utf-8':
        return new TextEncoder().encode(string).buffer;
      default:
        throw new Error('Encoding not supported: ' + pEncoding);
    }
  }
);

export const string_percent_encode = defineFunction(
  'string_percent_encode',
  [{ name: 'string' }, { name: 'safe_chars' }],
  (_ctx, { string, safe_chars }) => {
    return percent_encode(string, safe_chars);
  }
);

function percent_encode(
  str: string,
  context: 'component' | 'path' | 'query' | string[] = 'component'
) {
  const DEFAULT_SAFE_CHARACTERS = {
    component: "A-Za-z0-9\\-_.!~*'()",
    query: "A-Za-z0-9\\-_.!~*'()",
    path: "A-Za-z0-9\\-_.!~*'()\\/:",
  };

  let safePattern;

  if (Array.isArray(context)) {
    // Convert character list to regex-safe string
    const escaped = context
      .map((c) => c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
      .join('');
    safePattern = new RegExp(`^[${escaped}]$`);
  } else if (typeof context === 'string' && DEFAULT_SAFE_CHARACTERS[context]) {
    safePattern = new RegExp(`^[${DEFAULT_SAFE_CHARACTERS[context]}]$`);
  } else {
    throw new Error(
      "Invalid context: must be 'component', 'path', 'query' or an array of characters"
    );
  }

  const encoder = new TextEncoder();
  let result = '';

  for (const char of str) {
    if (safePattern.test(char)) {
      result += char;
    } else {
      const encodedBytes = encoder.encode(char);
      for (const byte of encodedBytes) {
        result += '%' + byte.toString(16).toUpperCase().padStart(2, '0');
      }
    }
  }

  return result;
}

export const string_percent_decode = defineFunction(
  'string_percent_decode',
  [{ name: 'string' }],
  (_ctx, { string }) => {
    return percent_decode(string);
  }
);

function percent_decode(str: string) {
  const bytes = [];

  for (let i = 0; i < str.length; ) {
    const char = str[i];

    if (char === '%') {
      if (i + 2 >= str.length) {
        throw new Error(
          `Invalid percent-encoding at position ${i}: incomplete sequence`
        );
      }

      const hex = str.slice(i + 1, i + 3);

      if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
        throw new Error(
          `Invalid percent-encoding at position ${i}: '${hex}' is not valid hex`
        );
      }

      bytes.push(parseInt(hex, 16));
      i += 3;
    } else {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(char);
      bytes.push(...encoded);
      i++;
    }
  }

  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(bytes));
}

export const string_to_number = defineFunction(
  'string_to_number',
  [{ name: 'string' }],
  (_ctx, { string }) => {
    return Number(string);
  },
  undefined,
  {
    description: 'Converts a string to a number',
    parameters: {
      string: 'The string to convert',
    },
    parameterExamples: {
      string: '"42"',
    },
    returns: 'The number representation of the string',
  }
);

export const string_split = defineFunction(
  'string_split',
  [{ name: 'string' }, { name: 'separator' }],
  (_ctx, { string, separator }) => {
    return string.split(separator);
  }
);

export const string_locale_compare = defineFunction(
  'string_locale_compare',
  [{ name: 'a' }, { name: 'b' }],
  (_ctx, { a, b }) => a.localeCompare(b)
);

export const string_trim = defineFunction(
  'string_trim',
  [{ name: 'string' }],
  (_ctx, { string }) => (string as string).trim()
);

export const string_starts_with = defineFunction(
  'string_starts_with',
  [{ name: 'string' }, { name: 'search' }],
  (_ctx, { string, search }) => (string as string).startsWith(search)
);

export const string_ends_with = defineFunction(
  'string_ends_with',
  [{ name: 'string' }, { name: 'search' }],
  (_ctx, { string, search }) => (string as string).endsWith(search)
);

export const string_contains = defineFunction(
  'string_contains',
  [{ name: 'string' }, { name: 'search' }, { name: 'ignoreCase' }],
  (_ctx, { string, search, ignoreCase }) =>
    ignoreCase
      ? (string as string)
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase())
      : (string as string).includes(search)
);

export const string_format = defineFunction(
  'string_format',
  [{ name: 'template' }, { name: 'values' }],
  string_format_impl
);

export const string_lower = defineFunction(
  'string_lower',
  [{ name: 'string' }],
  (_ctx, { string }) => (string as string).toLocaleLowerCase()
);

export const string_upper = defineFunction(
  'string_upper',
  [{ name: 'string' }],
  (_ctx, { string }) => (string as string).toLocaleUpperCase()
);

export const string_slice = defineFunction(
  'string_slice',
  [{ name: 'string' }, { name: 'start' }, { name: 'end' }],
  (_ctx, { string, start, end }) => (string as string).slice(start, end)
);

export const string_repeat = defineFunction(
  'string_repeat',
  [{ name: 'string' }, { name: 'count' }],
  (_ctx, { string, count }) => (string as string).repeat(count)
);

export const string_trim_start = defineFunction(
  'string_trim_start',
  [{ name: 'string' }],
  (_ctx, { string }) => (string as string).trimStart()
);

export const string_trim_end = defineFunction(
  'string_trim_end',
  [{ name: 'string' }],
  (_ctx, { string }) => (string as string).trimEnd()
);

export const string_pad_start = defineFunction(
  'string_pad_start',
  [{ name: 'string' }, { name: 'length' }, { name: 'fill' }],
  (_ctx, { string, length, fill }) => (string as string).padStart(length, fill)
);

export const string_pad_end = defineFunction(
  'string_pad_end',
  [{ name: 'string' }, { name: 'length' }, { name: 'fill' }],
  (_ctx, { string, length, fill }) => (string as string).padEnd(length, fill)
);

export const string_length = defineFunction(
  'string_length',
  [{ name: 'string' }],
  (_ctx, { string }) => (string as string).length
);

// Replace this implementation
const extractPlaceholdersRegexp = /\$[a-zA-Z_$]+[a-zA-Z_$0-9]*/g;

function replacePlaceholdersByLocals(ctx: RuntimeContext, str: string) {
  return str.replace(
    extractPlaceholdersRegexp,
    (name) => ctx.getLocalOr(name.substring(1), '') as string
  );
}

function replacePlaceholdersByExpressions(
  _ctx: RuntimeContext,
  str: string,
  values: { [key: string]: string }
) {
  return str.replace(extractPlaceholdersRegexp, (name) => {
    try {
      return values[name.substring(1)];
    } catch (err) {
      // TODO: Only return this when error is missing local
      return '';
    }
  });
}

function string_format_impl(
  ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  if (value.values) {
    return replacePlaceholdersByExpressions(
      ctx,
      value.template as string,
      value.values as { [key: string]: string }
    );
  } else {
    return replacePlaceholdersByLocals(ctx, value.template);
  }
}
