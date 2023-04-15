import { RuntimeContext } from 'tal-eval';
import { Component, ComputedProps } from '.';

/*
props:
  onClick,
  text,
  confirm,
  secondary,

// TODO: Inactive when expression is still evaluating
// TODO: Show confirm popup
// TODO: Secondary style
// TODO: Show popin when an error occurs
*/
export default class Button implements Component {
  private elem?: HTMLElement;

  onCreate(ctx: RuntimeContext, document: Document, props: ComputedProps) {
    const elem = document.createElement('button');
    elem.setAttribute('type', 'button');
    elem.textContent = props.text as string;
    elem.addEventListener('click', async () => {
      elem.disabled = true;
      try {
        await ctx.evaluateAsync(props.onClick as any);
      } catch (err) {
      } finally {
        elem.disabled = false;
      }
    });
    this.elem = elem;
    return elem;
  }

  onUpdate(_ctx: RuntimeContext, props: ComputedProps): Element {
    if (!this.elem) throw new Error('Button not created');
    this.elem.textContent = props.text as string;
    return this.elem;
  }
}
