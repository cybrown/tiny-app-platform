import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
import { Expression } from 'tal-parser';
import { RuntimeContext } from 'tal-eval';
import * as jsdom from 'jsdom';
import { compileTemplate, Button } from '../src/index';
import { t } from './helpers';

describe('Button component', () => {
  it('should instantiate Button element and update it', () => {
    const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
    dom.window.document;
    const ctx = new RuntimeContext(() => null, { Button });
    ctx.evaluate({
      kind: 'DeclareLocal',
      mutable: true,
      name: 'message',
      value: 'Hello, World !',
    });
    const template: Expression = t('Button', {
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
