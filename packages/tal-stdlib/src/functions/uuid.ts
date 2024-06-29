import { v4 as uuidv4 } from 'uuid';
import { defineFunction } from 'tal-eval';

export const uuid_v4 = defineFunction(
  'uuid_v4',
  [],
  () => uuidv4(),
  undefined,
  {
    description: 'Generate a random UUID v4',
    parameters: {},
    returns: 'A random UUID v4',
  }
);
