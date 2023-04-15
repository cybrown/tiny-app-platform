import { Expression, TemplateExpression } from 'tal-parser';

export function t(
  name: string,
  props: { [key: string]: Expression }
): TemplateExpression {
  return {
    kind: 'Template',
    component: { kind: 'Local', name },
    props: { kind: 'Object', value: props },
  };
}
