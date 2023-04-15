import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
import { Expression } from 'tal-parser';
import { RuntimeContext } from 'tal-eval';
import * as jsdom from 'jsdom';
import { compileTemplate, InputText } from '../src/index';
import { t } from './helpers';

describe('InputText component', () => {
  it('should instantiate InputText element and update it', () => {
    const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
    dom.window.document;
    const ctx = new RuntimeContext(() => null, { InputText });
    ctx.evaluate({
      kind: 'DeclareLocal',
      mutable: true,
      name: 'message',
      value: 'Hello, World !',
    });
    const template: Expression = t('InputText', {
      bindTo: { kind: 'Local', name: 'message' },
    });
    const result = compileTemplate(ctx, dom.window.document, template);

    expect((result as HTMLInputElement).value).toEqual('Hello, World !');

    ctx.evaluate({
      kind: 'SetValue',
      address: { kind: 'Local', name: 'message' },
      value: 'Hello, Toto !',
    });

    expect((result as HTMLInputElement).value).toEqual('Hello, Toto !');
  });
});
