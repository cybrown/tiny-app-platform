import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
import { Expression } from 'tal-parser';
import { RuntimeContext } from 'tal-eval';
import * as jsdom from 'jsdom';
import { compileTemplate, Text } from '../src/index';
import { t } from './helpers';

describe('Text component', () => {
  it('should instantiate Text element and update it', () => {
    const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
    dom.window.document;
    const ctx = new RuntimeContext(() => null, { Text });
    ctx.evaluate({
      kind: 'DeclareLocal',
      mutable: true,
      name: 'message',
      value: 'Hello, World !',
    });
    const template: Expression = t('Text', {
      text: { kind: 'Local', name: 'message' },
    });
    const result = compileTemplate(ctx, dom.window.document, template);

    expect(result.outerHTML).toContain('Hello, World !');

    ctx.evaluate({
      kind: 'SetValue',
      address: { kind: 'Local', name: 'message' },
      value: 'Hello, Toto !',
    });

    expect(result.outerHTML).toContain('Hello, Toto !');
  });
});
