import { RuntimeContext } from '../src';

describe('RuntimeContext', () => {
  it('Compute sum', () => {
    const ctx = new RuntimeContext(() => {}, {a: 2, b: 40});
    const result = ctx.evaluate({
      kind: "BinaryOperator",
      operator: "+",
      left: {kind: "Local", name: "a"},
      right: {kind: "Local", name: "b"}
    })
    expect(result).toEqual(42);
  });
});
