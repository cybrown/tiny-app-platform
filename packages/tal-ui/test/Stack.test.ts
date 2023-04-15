import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
import { Expression } from 'tal-parser';
import { RuntimeContext } from 'tal-eval';
import * as jsdom from 'jsdom';
import { compileTemplate, Text, Stack } from '../src/index';
import { t } from './helpers';

describe('Stack component', () => {
  it('should instantiate Stack element and update its content', () => {
    const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
    const ctx = new RuntimeContext(() => null, { Stack, Text });
    ctx.evaluate({
      kind: 'DeclareLocal',
      mutable: true,
      name: 'message1',
      value: 'Hello, World 1 !',
    });
    ctx.evaluate({
      kind: 'DeclareLocal',
      mutable: true,
      name: 'message2',
      value: 'Hello, World 2 !',
    });

    const template: Expression = t('Stack', {
      children: {
        kind: 'Array',
        value: [
          t('Text', {
            text: { kind: 'Local', name: 'message1' },
          }),
          t('Text', {
            text: { kind: 'Local', name: 'message2' },
          }),
        ],
      },
    });
    const result = compileTemplate(ctx, dom.window.document, template);

    expect(result.outerHTML).toContain('Hello, World 1 !');
    expect(result.outerHTML).toContain('Hello, World 2 !');

    ctx.evaluate({
      kind: 'SetValue',
      address: { kind: 'Local', name: 'message1' },
      value: 'Hello, Toto 1 !',
    });
    ctx.evaluate({
      kind: 'SetValue',
      address: { kind: 'Local', name: 'message2' },
      value: 'Hello, Toto 2 !',
    });

    expect(result.outerHTML).toContain('Hello, Toto 1 !');
    expect(result.outerHTML).toContain('Hello, Toto 2 !');
  });
});
