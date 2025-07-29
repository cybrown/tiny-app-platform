import { v4 as uuidv4 } from 'uuid';
import { defineFunction3, typeFunction, typeString } from 'tal-eval';

export const uuid_v4 = defineFunction3(
  'uuid_v4',
  [],
  typeFunction([], [], typeString()),
  () => uuidv4(),
  undefined,
  {
    description: 'Generate a random UUID v4',
    parameters: {},
    returns: 'A random UUID v4',
  }
);
