import { defineFunction } from 'tal-eval';

export const human_date = defineFunction(
  'human_date',
  [{ name: 'date' }],
  (_ctx, { date }) => {
    // date is a Date object or a string in ISO format
    const d: Date = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      return 'Invalid date';
    }

    // If the year is not the current year, return the month and year
    if (d.getFullYear() !== new Date().getFullYear()) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    }

    // If the month is not the current month, return the month and day
    if (d.getMonth() !== new Date().getMonth()) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }

    // Today, yesterday, or tomorrow
    if (d.getDate() === new Date().getDate()) {
      return d.toLocaleTimeString('en-US', {
        hour12: false,
        minute: '2-digit',
        hour: '2-digit',
      });
    }
    if (d.getDate() === new Date().getDate() - 1) {
      return 'Yesterday';
    }
    if (d.getDate() === new Date().getDate() + 1) {
      return 'Tomorrow';
    }

    // Otherwise, return the day of the week and the date
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
    });
  },
  undefined,
  {
    description: 'Convert a date to a human-readable format',
    parameters: {
      date: 'A Date object or a string in ISO format',
    },
    returns: 'Humanized date string',
  }
);
