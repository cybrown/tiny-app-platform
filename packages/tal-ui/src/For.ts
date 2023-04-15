import { RuntimeContext } from 'tal-eval';
import { Component, ComputedProps, compileTemplate } from '.';

// TODO: allow custom name for iteration value
// TODO: pass also current index
// TODO: special syntax for this component, like For value in values { ... } or For (index, value) in values { ... }
export default class Stack implements Component {
  private elem?: HTMLElement;
  private contexts: RuntimeContext[] = [];

  onCreate(ctx: RuntimeContext, document: Document, props: ComputedProps) {
    const elem = document.createElement('div');
    this.elem = elem;
    const child = (props.children as any)[0];
    const values = props.values as unknown[];
    for (let value of values) {
      const childContext = ctx.createChild({});
      childContext.declareLocal('value', {
        mutable: true,
        initialValue: value,
      });
      this.contexts.push(childContext);
      const childElement = compileTemplate(childContext, document, child);
      elem.appendChild(childElement);
    }
    return elem;
  }

  onUpdate(_ctx: RuntimeContext, props: ComputedProps): Element {
    if (!this.elem) throw new Error('Stack not created');
    const values = props.values as unknown[];
    let index = 0;
    const child = (props.children as any)[0];
    for (let value of values) {
      if (index < this.contexts.length) {
        const childContext = this.contexts[index];
        childContext.setLocal('value', value);
      } else {
        const childContext = _ctx.createChild({});
        childContext.declareLocal('value', {
          mutable: true,
          initialValue: value,
        });
        this.contexts.push(childContext);
        const childElement = compileTemplate(childContext, document, child);
        this.elem.appendChild(childElement);
      }
      index++;
    }
    for (let i2 = index; i2 < this.elem.childNodes.length; i2++) {
      this.elem.children[index].remove();
      this.contexts.pop();
    }
    return this.elem;
  }
}
