import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
import { TemplateExpression } from 'tal-parser';
import { RuntimeContext } from 'tal-eval';
import * as jsdom from 'jsdom';
import { Component, ComputedProps, compileTemplate } from '../src/index';
import { Text } from '../src';
import { t } from './helpers';

/*
Create a demo component
  Only to show text
Components to create:
  Text: Show some text
  Box: Contain another component to test a slot like feature
  Repeat / For / Each: Create and destroy component with an array
  Condition: Create or destroy folowwing a boolean value

Inflate template
  Instantiate controller
  Call on create method
  Call update method
  Call destruct method

  Call update method only if new props have changed

  Force some props to not evaluate, like bindTo, on*, maybe children etc...


*/

/*
class Box implements Component {
  onCreate(document: Document, props: ComputedProps): Element {
    const node = document.createElement('div');
    node.appendChild(props['child'] as any);
    return node;
  }
  onUpdate(elem: Element, _props: ComputedProps): Element {
    //throw new Error('Method not implemented.');
    return elem;
  }
}
*/

describe('Create elements from template', () => {
  it('should instantiate Box element and update its content', () => {
    class BoxWithTitle implements Component {
      private title?: Element;
      private elem?: Element;

      onCreate(
        _ctx: RuntimeContext,
        document: Document,
        props: ComputedProps
      ): Element {
        const node = document.createElement('div');
        const title = document.createElement('span');
        title.textContent = props['title'] as any;
        this.title = title;
        node.appendChild(title);
        const compiledNode = compileTemplate(
          ctx,
          dom.window.document,
          props['child'] as any
        );
        node.appendChild(compiledNode);
        this.elem = node;
        return node;
      }

      onUpdate(_ctx: RuntimeContext, props: ComputedProps): Element {
        if (!this.elem) {
          throw new Error('BoxWithTitle not created');
        }
        if (this.title) {
          this.title.textContent = props['title'] as any;
        }
        return this.elem;
      }
    }

    const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
    dom.window.document;
    const ctx = new RuntimeContext(() => null, { Text, BoxWithTitle });

    ctx.evaluate({
      kind: 'DeclareLocal',
      mutable: true,
      name: 'message',
      value: 'Hello, World !',
    });
    ctx.evaluate({
      kind: 'DeclareLocal',
      mutable: true,
      name: 'greet',
      value: 'Greetings',
    });
    const template: TemplateExpression = t('BoxWithTitle', {
      title: { kind: 'Local', name: 'greet' },
      child: t('Text', {
        text: { kind: 'Local', name: 'message' },
      }),
    });
    const result = compileTemplate(ctx, dom.window.document, template);

    expect(result.outerHTML).toContain('Greetings');
    expect(result.outerHTML).toContain('Hello, World !');

    ctx.evaluate({
      kind: 'SetValue',
      address: { kind: 'Local', name: 'message' },
      value: 'Hello, Toto !',
    });
    ctx.evaluate({
      kind: 'SetValue',
      address: { kind: 'Local', name: 'greet' },
      value: 'Re',
    });

    expect(result.outerHTML).toContain('Re');
    expect(result.outerHTML).toContain('Hello, Toto !');
  });

  it('should instantiate Repeat element and update its content', () => {
    // TODO: accept an array on which to iterate
    // TODO: Check update nodes when length is the same
    // TODO: Store child contexts in an array
    // TODO: When new array has less elements, call destructor of old child contexts
    // TODO: When incoming array changes, change each child context
    // TODO: See if it's possible to keep a key for each value in the array
    class Repeat implements Component {
      private elem?: Element;
      private nodeWithChildren?: Element;

      onCreate(
        _ctx: RuntimeContext,
        document: Document,
        props: ComputedProps
      ): Element {
        const node = document.createElement('div');
        const num = props['num'] as number;
        for (let i = 0; i < num; i++) {
          const childCtx = ctx.createChild({
            i: 'value_' + i,
          });
          const childElement = compileTemplate(
            childCtx,
            dom.window.document,
            props['child'] as any
          );
          node.appendChild(childElement);
        }
        this.nodeWithChildren = node;
        this.elem = node;
        return node;
      }

      onUpdate(
        _ctx: RuntimeContext,
        props: ComputedProps,
        old: ComputedProps
      ): Element {
        if (!this.elem) {
          throw new Error('Repeat not created');
        }
        if (!this.nodeWithChildren) {
          return this.elem;
        }
        const newNum = props['num'] as number;
        const oldNum = old['num'] as number;
        const numberToCreate = newNum - oldNum;
        if (numberToCreate == 0) {
          return this.elem;
        }
        if (numberToCreate < 0) {
          while (this.nodeWithChildren.children.length > newNum) {
            this.nodeWithChildren.lastChild?.remove();
          }
        } else if (numberToCreate > 0) {
          for (let i = this.nodeWithChildren.children.length; i < newNum; i++) {
            const childCtx = ctx.createChild({
              i: 'value_' + i,
            });
            const childElement = compileTemplate(
              childCtx,
              dom.window.document,
              props['child'] as any
            );
            this.nodeWithChildren.appendChild(childElement);
          }
        }
        return this.elem;
      }
    }

    const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
    dom.window.document;
    const ctx = new RuntimeContext(() => null, { Text, Repeat });

    ctx.evaluate({
      kind: 'DeclareLocal',
      mutable: true,
      name: 'num',
      value: 3,
    });

    const template: TemplateExpression = t('Repeat', {
      num: { kind: 'Local', name: 'num' },
      child: t('Text', {
        text: { kind: 'Local', name: 'i' },
      }),
    });
    const result = compileTemplate(ctx, dom.window.document, template);

    expect(result.outerHTML).toContain('value_0');
    expect(result.outerHTML).toContain('value_1');
    expect(result.outerHTML).toContain('value_2');
    expect(result.outerHTML).not.toContain('value_3');

    ctx.evaluate({
      kind: 'SetValue',
      address: { kind: 'Local', name: 'num' },
      value: 2,
    });

    expect(result.outerHTML).toContain('value_0');
    expect(result.outerHTML).toContain('value_1');
    expect(result.outerHTML).not.toContain('value_2');

    ctx.evaluate({
      kind: 'SetValue',
      address: { kind: 'Local', name: 'num' },
      value: 5,
    });

    expect(result.outerHTML).toContain('value_0');
    expect(result.outerHTML).toContain('value_1');
    expect(result.outerHTML).toContain('value_2');
    expect(result.outerHTML).toContain('value_3');
    expect(result.outerHTML).toContain('value_4');
    expect(result.outerHTML).not.toContain('value_5');
  });
});
