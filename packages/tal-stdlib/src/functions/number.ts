import {
  typeBoolean,
  typeNull,
  typeNumber,
  typeUnion,
  typeString,
  defineFunction3,
  typeFunction,
} from 'tal-eval';

export const number_is_nan = defineFunction3(
  'number_is_nan',
  [
    {
      name: 'number',
    },
  ],
  typeFunction([{ name: 'number', type: typeNumber() }], [], typeBoolean()),
  (_ctx, { number }) => {
    return Number.isNaN(number);
  }
);

export const number_to_string = defineFunction3(
  'number_to_string',
  [
    { name: 'number' },
    {
      name: 'precision',
      onlyNamed: true,
    },
    {
      name: 'base',
      onlyNamed: true,
    },
    {
      name: 'code',
      onlyNamed: true,
    },
  ],
  typeFunction(
    [
      { name: 'number', type: typeNumber() },
      {
        name: 'precision',
        type: typeUnion(typeNull(), typeNumber()),
      },
      {
        name: 'base',
        type: typeUnion(typeNull(), typeNumber()),
      },
      {
        name: 'code',
        type: typeUnion(typeNull(), typeBoolean()),
      },
    ],
    [],
    typeString()
  ),
  (_ctx, { number, precision, base, code }) => {
    if (typeof number != 'number') {
      throw new Error('Only numbers are supported');
    }

    if (base != null && precision != null && precision > 0) {
      throw new Error('base and precision are exclusive');
    }

    if (code && base != null && ![2, 10, 16].includes(base)) {
      throw new Error(
        'base, if defined, must be included in (2, 10, 16) when code is true'
      );
    }

    let result: string;

    if (precision != null && precision > 0) {
      result = number.toFixed(precision);
    } else if (base != null) {
      result = (precision != null ? Math.round(number) : number).toString(base);
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
      if (base === 2) {
        if (resultAsCode.includes('.')) {
          throw new Error('Floating numbers are only supported in base 10');
        }
        return (isNegative ? '-' : '') + '0b' + resultAsCode;
      } else if (base === 16) {
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
    description:
      'Convert a number to a string with optional base, precision, or code prefix',
    parameters: {
      number: 'Number to convert',
      precision: 'Number of digits after the decimal point (named)',
      base: 'Radix for conversion (2, 10, 16) exclusive with precision (named)',
      code: 'Include numeric literal prefix (0b, 0x) if true (named)',
    },
    returns: 'String representation of the number',
  }
);

export const number_ceil = defineFunction3(
  'number_ceil',
  [{ name: 'number' }],
  typeFunction([{ name: 'number', type: typeNumber() }], [], typeNumber()),
  (_ctx, { number }) => Math.ceil(number),
  undefined,
  {
    description: 'Round a number up to the nearest integer',
    parameters: { number: 'Number to ceil' },
    returns: 'Smallest integer greater than or equal to the input',
  }
);

export const number_floor = defineFunction3(
  'number_floor',
  [{ name: 'number' }],
  typeFunction([{ name: 'number', type: typeNumber() }], [], typeNumber()),
  (_ctx, { number }) => Math.floor(number),
  undefined,
  {
    description: 'Round a number down to the nearest integer',
    parameters: { number: 'Number to floor' },
    returns: 'Largest integer less than or equal to the input',
  }
);

export const number_round = defineFunction3(
  'number_round',
  [{ name: 'number' }, { name: 'precision' }],
  typeFunction(
    [
      { name: 'number', type: typeNumber() },
      { name: 'precision', type: typeUnion(typeNull(), typeNumber()) },
    ],
    [],
    typeNumber()
  ),
  (_ctx, { number, precision }) => {
    if (precision == null || precision === 0) {
      return Math.round(number);
    }
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  },
  undefined,
  {
    description: 'Round a number to a given precision',
    parameters: {
      number: 'Number to round',
      precision: 'Number of decimal places',
    },
    returns: 'Rounded number',
  }
);

export const number_trunc = defineFunction3(
  'number_trunc',
  [{ name: 'number' }],
  typeFunction([{ name: 'number', type: typeNumber() }], [], typeNumber()),
  (_ctx, { number }) => Math.trunc(number),
  undefined,
  {
    description: 'Truncate a number by removing fractional digits',
    parameters: { number: 'Number to truncate' },
    returns: 'Integer part of the number',
  }
);

export const number_abs = defineFunction3(
  'number_abs',
  [{ name: 'number' }],
  typeFunction([{ name: 'number', type: typeNumber() }], [], typeNumber()),
  (_ctx, { number }) => Math.abs(number),
  undefined,
  {
    description: 'Get the absolute value of a number',
    parameters: { number: 'Number to get absolute value of' },
    returns: 'Absolute value of the input',
  }
);

export const number_sign = defineFunction3(
  'number_sign',
  [{ name: 'number' }],
  typeFunction([{ name: 'number', type: typeNumber() }], [], typeNumber()),
  (_ctx, { number }) => Math.sign(number),
  undefined,
  {
    description: 'Get the sign of a number',
    parameters: { number: 'Number to get sign of' },
    returns: '-1, 0, or 1 depending on the sign',
  }
);

export const number_random = defineFunction3(
  'number_random',
  [],
  typeFunction([], [], typeNumber()),
  (_ctx) => Math.random(),
  undefined,
  {
    description: 'Generate a floating-point random number in [0,1)',
    parameters: {},
    returns: 'Random number between 0 (inclusive) and 1 (exclusive)',
  }
);

export const number_randint = defineFunction3(
  'number_randint',
  [{ name: 'min' }, { name: 'max' }],
  typeFunction(
    [
      { name: 'min', type: typeUnion(typeNull(), typeNumber()) },
      { name: 'max', type: typeUnion(typeNull(), typeNumber()) },
    ],
    [],
    typeNumber()
  ),
  (_ctx, { min, max }) => {
    const pMin = min ?? 0;
    const pMax = max ?? 100;
    return Math.floor(Math.random() * (pMax - pMin + 1)) + pMin;
  },
  undefined,
  {
    description: 'Generate a random integer between min and max inclusive',
    parameters: {
      min: 'Lower bound (inclusive)',
      max: 'Upper bound (inclusive)',
    },
    returns: 'Random integer between min and max',
  }
);
