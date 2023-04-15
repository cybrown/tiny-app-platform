import { RuntimeContext } from 'tal-eval';
import { Component, ComputedProps, compileTemplate } from '.';
import { TemplateExpression } from 'tal-parser';

export default class Stack implements Component {
  private elem?: HTMLElement;

  onCreate(ctx: RuntimeContext, document: Document, props: ComputedProps) {
    const elem = document.createElement('div');
    this.elem = elem;
    for (let child of props.children as TemplateExpression[]) {
      // TODO: Create child contexts ?
      const childElement = compileTemplate(ctx, document, child);
      elem.appendChild(childElement);
    }
    return elem;
  }

  onUpdate(_ctx: RuntimeContext, _props: ComputedProps): Element {
    if (!this.elem) throw new Error('Stack not created');
    // TODO: do work here
    return this.elem;
  }
}
