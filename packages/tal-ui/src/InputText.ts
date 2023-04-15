import { RuntimeContext } from 'tal-eval';
import { Component, ComputedProps } from '.';

export default class InputText implements Component {
  private elem?: HTMLInputElement;

  onCreate(ctx: RuntimeContext, document: Document, props: ComputedProps) {
    const elem = document.createElement('input');
    elem.setAttribute('type', 'text');
    elem.value = ctx.evaluate(props['bindTo'] as any) as string;
    elem.addEventListener('input', () => {
      ctx.setValue(props['bindTo'] as any, elem.value);
    });
    this.elem = elem;
    return elem;
  }

  onUpdate(ctx: RuntimeContext, props: ComputedProps): Element {
    if (!this.elem) throw new Error('InputText not created');
    this.elem.value = ctx.evaluate(props['bindTo'] as any) as string;
    return this.elem;
  }
}
