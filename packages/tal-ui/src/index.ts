import { Expression } from 'tal-parser';
import { RuntimeContext } from 'tal-eval';
import Text from './Text';
import InputText from './InputText';
import Stack from './Stack';
import Button from './Button';
import For from './For';
export { Text, InputText, Stack, Button, For };

export type ComputedProps = { [key: string]: unknown };

export interface Component {
  onCreate(
    ctx: RuntimeContext,
    document: Document,
    props: ComputedProps
  ): Element;
  onUpdate(
    ctx: RuntimeContext,
    props: ComputedProps,
    oldProps: ComputedProps
  ): Element;
}

type ComponentConstructor = new () => Component;

type Template = {
  Component: ComponentConstructor;
  props: object;
};

function defineTemplate(
  component: ComponentConstructor,
  props: object
): Template {
  return {
    Component: component,
    props,
  };
}

function shouldEvalKey(key: string) {
  if (key == 'bindTo' || key.startsWith('on')) {
    return false;
  }
  return true;
}

export function compileTemplate(
  ctx: RuntimeContext,
  document: Document,
  template: Expression
): Element {
  const inflater = new TemplateInflater(ctx, document, template);
  return inflater.node;
}

class TemplateInflater {
  private _node: Element;
  private component: Component;
  private template: Template;
  private oldProps: ComputedProps;

  public get node() {
    return this._node;
  }

  private doUpdate = () => {
    this.update(this.template);
  };

  constructor(
    private ctx: RuntimeContext,
    private document: Document,
    templateExpr: Expression
  ) {
    ctx.registerStateChangedListener(this.doUpdate);
    if (
      !templateExpr ||
      typeof templateExpr !== 'object' ||
      templateExpr.kind != 'Template'
    ) {
      throw new Error('Only template are supported in template inflation');
    }
    // TODO: Maybe don't evaluate template expression here, but let the evaluator do it ?
    const template = defineTemplate(
      ctx.evaluate(templateExpr.component) as any,
      templateExpr.props.value
    );
    const evaluatedProps = Object.fromEntries(
      Object.entries(template.props).map(([key, expr]) => [
        key,
        shouldEvalKey(key) ? this.ctx.evaluate(expr) : expr,
      ])
    );
    this.oldProps = evaluatedProps;
    const component = new template.Component();

    const node = component.onCreate(ctx, this.document, evaluatedProps);
    this._node = node;
    this.component = component;
    this.template = template;
  }

  private update(template: Template): Element {
    // TODO: Filter on keys that should not be evaluated, because expressions must not change
    const evaluatedProps = Object.fromEntries(
      Object.entries(template.props).map(([key, expr]) => [
        key,
        shouldEvalKey(key) ? this.ctx.evaluate(expr) : expr,
      ])
    );

    // const allKeys = new Set([
    //   ...Object.keys(evaluatedProps),
    //   ...Object.keys(this.oldProps),
    // ]);
    // let runUpdate = false;
    // for (let key of allKeys) {
    //   if (!(key in evaluatedProps) || !(key in this.oldProps)) {
    //     runUpdate = true;
    //     break;
    //   } else if (evaluatedProps[key] !== this.oldProps[key]) {
    //     runUpdate = true;
    //     break;
    //   }
    // }
    // if (runUpdate) {
    this.component.onUpdate(this.ctx, evaluatedProps, this.oldProps);
    this.oldProps = evaluatedProps;
    // }
    return this._node;
  }
}
