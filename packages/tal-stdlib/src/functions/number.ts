import { defineFunction } from 'tal-eval';

export const number_to_string = defineFunction(
  'number_to_string',
  [
    { name: 'number' },
    { name: 'precision', onlyNamed: true },
    { name: 'base', onlyNamed: true },
    { name: 'code', onlyNamed: true },
  ],
  (_ctx, { number, precision, base, code }) => {
    if (typeof number != 'number') {
      throw new Error('Only number are supported');
    }

    if (base != null && precision != null && precision > 0) {
      throw new Error('base and precision and exclusive');
    }

    if (code && base != null && ![2, 10, 16].includes(base)) {
      throw new Error(
        'base, if defined, must be included in (2, 10, 16) when code is true'
      );
    }

    let result;

    if (precision != null && precision > 0) {
      result = (number as number).toFixed(precision);
    } else if (base != null) {
      result = (
        precision != null ? Math.round(number as number) : (number as number)
      ).toString(base);
    } else {
      result = String(number);
    }

    if (code) {
      let isNegative = false;
      let resultAsCode = result;
      if (resultAsCode.startsWith('-')) {
        resultAsCode = resultAsCode.slice(1);
        isNegative = true;
      }
      if (base == 2) {
        if (resultAsCode.includes('.')) {
          throw new Error('Floating numbers are only supported in base 10');
        }
        return (isNegative ? '-' : '') + '0b' + resultAsCode;
      } else if (base == 16) {
        if (resultAsCode.includes('.')) {
          throw new Error('Floating numbers are only supported in base 10');
        }
        return (isNegative ? '-' : '') + '0x' + resultAsCode;
      }
    }

    return result;
  },
  undefined,
  {
    description: 'Convert a number to a string',
    parameters: {
      number: 'Number to convert',
      base: 'Base to convert the number to, exclusive with precision except when precision == 0',
      precision: 'Number of number after the point, uses rounding',
      code: 'Convert to a code compatible representation',
    },
    returns: 'A string representing the number',
  }
);

export const number_ceil = defineFunction(
  'number_ceil',
  [{ name: 'number' }],
  (_ctx, { number }) => {
    return Math.ceil(number);
  }
);

export const number_floor = defineFunction(
  'number_floor',
  [{ name: 'number' }],
  (_ctx, { number }) => {
    return Math.floor(number);
  }
);

export const number_round = defineFunction(
  'number_round',
  [{ name: 'number' }, { name: 'precision' }],
  (_ctx, { number, precision }) => {
    if (precision == null || precision === 0) {
      return Math.round(number);
    }
    return +(
      Math.round(Number(number + ('e+' + precision))) +
      ('e-' + precision)
    );
  }
);

export const number_trunc = defineFunction(
  'number_trunc',
  [{ name: 'number' }],
  (_ctx, { number }) => {
    return Math.trunc(number);
  }
);

export const number_abs = defineFunction(
  'number_abs',
  [{ name: 'number' }],
  (_ctx, { number }) => {
    return Math.abs(number);
  }
);

export const number_sign = defineFunction(
  'number_sign',
  [{ name: 'number' }],
  (_ctx, { number }) => {
    return Math.sign(number);
  }
);

export const number_random = defineFunction('number_random', [], (_ctx) => {
  return Math.random();
});

export const number_randint = defineFunction(
  'number_randint',
  [{ name: 'min' }, { name: 'max' }],
  (_ctx, { min, max }) => {
    const pMin = min ?? 0;
    const pMax = max ?? 100;
    return Math.floor(Math.random() * (pMax - pMin + 1)) + pMin;
  }
);
