import { RuntimeContext } from 'tal-eval';
import { Component, ComputedProps } from '.';

export default class Text implements Component {
  private elem?: HTMLElement;

  onCreate(_ctx: RuntimeContext, document: Document, props: ComputedProps) {
    const elem = document.createElement('div');
    elem.textContent = props.text as string;
    this.elem = elem;
    return elem;
  }

  onUpdate(_ctx: RuntimeContext, props: ComputedProps): Element {
    if (!this.elem) throw new Error('Text not created');
    this.elem.textContent = props.text as string;
    return this.elem;
  }
}
