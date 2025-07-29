import {
  defineFunction3,
  metadataSet,
  typeFunction,
  typeKindedRecord,
  typeNumber,
} from 'tal-eval';

export const flex = defineFunction3(
  'flex',
  [{ name: 'value' }, { name: 'flexValue' }],
  typeFunction(
    [
      { name: 'value', type: typeKindedRecord() },
      { name: 'flexValue', type: typeNumber() },
    ],
    [],
    typeKindedRecord()
  ),
  (_ctx, { value, flexValue }) => {
    metadataSet(value, { flexGrow: flexValue });
    return value;
  }
);

export const scroller = defineFunction3(
  'scroller',
  [{ name: 'value' }],
  typeFunction(
    [{ name: 'value', type: typeKindedRecord() }],
    [],
    typeKindedRecord()
  ),
  (_ctx, { value }) => {
    metadataSet(value, { flexGrow: 1, flexShrink: 1, scroller: true });
    return value;
  }
);
