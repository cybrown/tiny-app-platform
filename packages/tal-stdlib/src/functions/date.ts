import { defineFunction } from 'tal-eval';

// Format: "2023-07-27T09:40:00.000Z"
export const date_from_iso_string = defineFunction(
  'date_from_iso_string',
  [{ name: 'str' }],
  (_ctx, { str }) => {
    return new Date(str);
  },
  undefined,
  {
    description: 'Parse an ISO 8601 string into a Date object',
    parameters: { str: 'ISO 8601 string to parse' },
    returns: 'Date object representing the parsed time',
  }
);

// Format: "2023-07-27T09:40:00.000Z"
export const date_to_iso_string_utc = defineFunction(
  'date_to_iso_string_utc',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.toISOString();
  },
  undefined,
  {
    description: 'Convert a Date object to an ISO 8601 string in UTC',
    parameters: { date: 'Date to convert' },
    returns: 'ISO 8601 string representation in UTC',
  }
);

export const date_now = defineFunction(
  'date_now',
  [],
  (_ctx, {}) => {
    return new Date();
  },
  undefined,
  {
    description: 'Get the current date and time',
    parameters: {},
    returns: 'Current Date object',
  }
);

const CURRENT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const date_current_timezone = defineFunction(
  'date_current_timezone',
  [],
  (_ctx, {}) => {
    return CURRENT_TIMEZONE;
  },
  undefined,
  {
    description: 'Get the system’s current IANA timezone identifier',
    parameters: {},
    returns: 'Current timezone string',
  }
);

const PARSE_DATE_REGEXP = /^(\d+)\/(\d+)\/(\d+)[^0-9]+(\d+):(\d+):(\d+)/;

export const date_to_timezone = defineFunction(
  'date_to_timezone',
  [{ name: 'date' }, { name: 'tz' }],
  (_ctx, { date, tz = CURRENT_TIMEZONE }) => {
    date.toLocaleString('iso', { timeZone: tz, hour12: false, hourFormat: 24 });
    const [day, month, year, hour, minutes, seconds] = date
      .toLocaleString('iso', { timeZone: tz, hour12: false, hourFormat: 24 })
      .match(PARSE_DATE_REGEXP)
      .slice(1);
    return new Date(
      Date.UTC(
        year,
        month,
        day,
        hour,
        minutes,
        seconds,
        date.getUTCMilliseconds()
      )
    );
  },
  undefined,
  {
    description: 'Convert a Date object to a specific timezone',
    parameters: {
      date: 'Date to convert',
      tz: 'Target IANA timezone identifier',
    },
    returns: 'Date object adjusted to the target timezone',
  }
);

export const date_year = defineFunction(
  'date_year',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCFullYear();
  },
  undefined,
  {
    description: 'Get the UTC full year from a Date object',
    parameters: { date: 'Date object' },
    returns: 'Year as a number (UTC)',
  }
);

export const date_month = defineFunction(
  'date_month',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCMonth();
  },
  undefined,
  {
    description: 'Get the UTC month (0-11) from a Date object',
    parameters: { date: 'Date object' },
    returns: 'Month index as a number (0 = January)',
  }
);

export const date_day_of_month = defineFunction(
  'date_day_of_month',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCDate();
  },
  undefined,
  {
    description: 'Get the UTC day of the month (1-31) from a Date object',
    parameters: { date: 'Date object' },
    returns: 'Day of the month as a number',
  }
);

export const date_day_of_week = defineFunction(
  'date_day_of_week',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCDay();
  },
  undefined,
  {
    description: 'Get the UTC day of the week (0-6) from a Date object',
    parameters: { date: 'Date object' },
    returns: 'Day of the week as a number (0 = Sunday)',
  }
);

export const date_hours = defineFunction(
  'date_hours',
  [{ name: 'date' }, { name: 'tz' }],
  (_ctx, { date }: { date: Date; tz: string }) => {
    return date.getUTCHours();
  },
  undefined,
  {
    description: 'Get the UTC hours (0-23) from a Date object',
    parameters: {
      date: 'Date object',
      tz: 'Timezone identifier (unused)',
    },
    returns: 'Hour component as a number',
  }
);

export const date_minutes = defineFunction(
  'date_minutes',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCMinutes();
  },
  undefined,
  {
    description: 'Get the UTC minutes (0-59) from a Date object',
    parameters: { date: 'Date object' },
    returns: 'Minute component as a number',
  }
);

export const date_seconds = defineFunction(
  'date_seconds',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCSeconds();
  },
  undefined,
  {
    description: 'Get the UTC seconds (0-59) from a Date object',
    parameters: { date: 'Date object' },
    returns: 'Second component as a number',
  }
);

export const date_milli_seconds = defineFunction(
  'date_milli_seconds',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCMilliseconds();
  },
  undefined,
  {
    description: 'Get the UTC milliseconds (0-999) from a Date object',
    parameters: { date: 'Date object' },
    returns: 'Milliseconds component as a number',
  }
);
