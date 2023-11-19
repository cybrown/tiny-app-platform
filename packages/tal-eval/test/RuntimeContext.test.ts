import { RuntimeContext } from '../src';

describe('RuntimeContext', () => {
  it('Compute sum', () => {
    const ctx = new RuntimeContext(() => {}, { a: 2, b: 40 });
    ctx.program = {};
    const result = ctx.evaluate({
      kind: 'INTRINSIC',
      operation: 'INTRINSIC_ADD',
      children: [
        { kind: 'LOCAL', name: 'a' },
        { kind: 'LOCAL', name: 'b' },
      ],
    });
    expect(result).toEqual(42);
  });
});
