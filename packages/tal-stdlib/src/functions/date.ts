import { defineFunction } from 'tal-eval';

// Format: "2023-07-27T09:40:00.000Z"
export const date_from_iso_string = defineFunction(
  'date_from_iso_string',
  [{ name: 'str' }],
  (_ctx, { str }) => {
    return new Date(str);
  }
);

// Format: "2023-07-27T09:40:00.000Z"
export const date_to_iso_string_utc = defineFunction(
  'date_to_iso_string_utc',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.toISOString();
  }
);

export const date_now = defineFunction(
  'date_now',
  [{ name: 'date' }],
  (_ctx, {}) => {
    return new Date();
  }
);

const CURRENT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const date_current_timezone = defineFunction(
  'date_current_timezone',
  [{ name: 'date' }],
  (_ctx, {}) => {
    return CURRENT_TIMEZONE;
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
  }
);

export const date_year = defineFunction(
  'date_year',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCFullYear();
  }
);

export const date_month = defineFunction(
  'date_month',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCMonth();
  }
);

export const date_day_of_month = defineFunction(
  'date_day_of_month',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCDate();
  }
);

export const date_day_of_week = defineFunction(
  'date_day_of_week',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCDay();
  }
);

export const date_hours = defineFunction(
  'date_hours',
  [{ name: 'date' }, { name: 'tz' }],
  (_ctx, { date }: { date: Date; tz: string }) => {
    return date.getUTCHours();
  }
);

export const date_minutes = defineFunction(
  'date_minutes',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCMinutes();
  }
);

export const date_seconds = defineFunction(
  'date_seconds',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCSeconds();
  }
);

export const date_milli_seconds = defineFunction(
  'date_milli_seconds',
  [{ name: 'date' }],
  (_ctx, { date }: { date: Date }) => {
    return date.getUTCMilliseconds();
  }
);
