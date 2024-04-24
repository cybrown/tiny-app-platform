import {
  Expression,
  ExpressionByKind,
  isAddressableExpression,
} from 'tal-parser';
import { AnyForNever } from './core';

class Lowerer {
  public lowerTopLevel(expr: Expression[]): Expression[] {
    const exportedNames: string[] = [];
    const result: Expression[] = [];
    for (let e of expr) {
      if (e.kind === 'Export') {
        if (e.expr.kind !== 'DeclareLocal' || e.expr.mutable) {
          throw new Error(
            'Only immutable values and function definitions can be exported'
          );
        }
        result.push(this.lowerSingle(e.expr));
        exportedNames.push(e.expr.name);
      } else {
        result.push(this.lowerSingle(e));
      }
    }
    if (exportedNames.length) {
      result.push({
        kind: 'Record',
        value: Object.fromEntries(
          exportedNames.map(name => [name, { kind: 'Local', name }])
        ),
      });
    }
    return result;
  }

  public lowerForApp(expr: Expression[]): Expression[] {
    const result = this.lowerTopLevel(expr);

    const head = result.slice(0, -1);
    const last = result[result.length - 1];
    if (!last) {
      return [];
    }

    const rootWidget: Expression = {
      kind: 'DeclareLocal',
      location: last.location,
      mutable: false,
      name: '$$ROOT$$',
      value: {
        kind: 'Function',
        location: last.location,
        parameters: [],
        body: {
          kind: 'BlockOfExpressions',
          children: [last],
        },
      },
    };

    const lastFunction: Expression = {
      kind: 'Function',
      parameters: [],
      location: last.location,
      body: {
        kind: 'Function',
        parameters: [],
        body: {
          kind: 'KindedRecord',
          location: last.location,
          value: {
            kind: { kind: 'Local', location: last.location, name: '$$ROOT$$' },
          },
        },
      },
    };

    return [...head, rootWidget, lastFunction];
  }

  public lowerArray(
    expr: Expression[],
    returnArrayFromBlock = false
  ): Expression[] {
    return expr
      .map(e => this.lowerSingle(e, returnArrayFromBlock))
      .filter(removeNodes);
  }

  public lowerSingle(
    expr: Expression,
    returnArrayFromBlock = false
  ): Expression {
    switch (expr.kind) {
      case 'Literal': {
        return expr;
      }
      case 'Local': {
        return expr;
      }
      case 'Attribute': {
        return {
          ...expr,
          value: this.lowerSingle(expr.value),
        };
      }
      case 'Index': {
        return {
          ...expr,
          index: this.lowerSingle(expr.index),
          value: this.lowerSingle(expr.value),
        };
      }
      case 'Array': {
        return {
          ...expr,
          value: this.lowerArray(expr.value),
        };
      }
      case 'If': {
        return {
          ...expr,
          condition: this.lowerSingle(expr.condition),
          ifTrue: this.lowerSingle(expr.ifTrue, returnArrayFromBlock),
          ifFalse: expr.ifFalse
            ? this.lowerSingle(expr.ifFalse, returnArrayFromBlock)
            : { kind: 'Literal', value: null },
        };
      }
      case 'Record': {
        return {
          ...expr,
          value: Object.fromEntries(
            Object.entries(expr.value).map(([key, value]) => [
              key,
              this.lowerSingle(value),
            ])
          ),
        };
      }
      case 'Assign': {
        return {
          ...expr,
          value: this.lowerSingle(expr.value),
        };
      }
      case 'Function': {
        return {
          ...expr,
          body: this.lowerSingle(expr.body),
        };
      }
      case 'Call': {
        return {
          ...expr,
          value: this.lowerSingle(expr.value),
          args: expr.args.map(arg => ({
            ...arg,
            value: this.lowerSingle(arg.value),
          })),
        };
      }
      case 'SubExpression': {
        return this.lowerSingle(expr.expr);
      }
      case 'Pipe': {
        let [previous, current, ...rest] = [expr.first, ...expr.values];
        while (true) {
          if (current.kind === 'Call') {
            previous = {
              ...current,
              args: [
                { argKind: 'Positional', value: previous },
                ...current.args,
              ],
            };
          } else {
            previous = {
              kind: 'Call',
              location: previous.location,
              value: current,
              args: [{ argKind: 'Positional', value: previous }],
            };
          }
          const nextCurrent = rest.shift();
          if (!nextCurrent) {
            break;
          }
          current = nextCurrent;
        }
        return this.lowerSingle(previous);
      }
      case 'UnaryOperator': {
        return {
          ...expr,
          operand: this.lowerSingle(expr.operand),
        };
      }
      case 'BinaryOperator': {
        if (expr.operator == '&&') {
          return {
            kind: 'BlockOfExpressions',
            forceNotWidget: true,
            children: [
              {
                kind: 'DeclareLocal',
                mutable: false,
                location: expr.location,
                value: this.lowerSingle(expr.left),
                name: 'tmp_left',
              },
              {
                kind: 'If',
                location: expr.location,
                condition: {
                  kind: 'Local',
                  name: 'tmp_left',
                  location: expr.location,
                },
                ifTrue: this.lowerSingle(expr.right),
                ifFalse: {
                  kind: 'Local',
                  name: 'tmp_left',
                  location: expr.location,
                },
              },
            ],
          };
        }
        if (expr.operator == '||') {
          return {
            kind: 'BlockOfExpressions',
            forceNotWidget: true,
            children: [
              {
                kind: 'DeclareLocal',
                mutable: false,
                location: expr.location,
                value: this.lowerSingle(expr.left),
                name: 'tmp_left',
              },
              {
                kind: 'If',
                location: expr.location,
                condition: {
                  kind: 'Local',
                  name: 'tmp_left',
                  location: expr.location,
                },
                ifTrue: {
                  kind: 'Local',
                  name: 'tmp_left',
                  location: expr.location,
                },
                ifFalse: this.lowerSingle(expr.right),
              },
            ],
          };
        }
        return {
          ...expr,
          left: this.lowerSingle(expr.left),
          right: this.lowerSingle(expr.right),
        };
      }
      case 'BlockOfExpressions': {
        return this.lowerBlockOfExpressions(expr, returnArrayFromBlock);
      }
      case 'DeclareLocal': {
        let value = null;
        if (expr.value) {
          value = this.lowerSingle(expr.value);
          if (value.kind == 'Function') {
            (value as any).name = expr.name;
          }
        }
        return {
          ...expr,
          ...(value ? { value } : {}),
        };
      }
      case 'KindedRecord': {
        const bindToProps: Record<string, Expression> = {};
        if (
          expr.value['bindTo'] &&
          !Array.isArray(expr.value['bindTo']) &&
          isAddressableExpression(expr.value['bindTo'])
        ) {
          bindToProps.value = expr.value['bindTo'];
          bindToProps.onChange = {
            kind: 'Function',
            parameters: ['newValue'],
            body: {
              kind: 'BlockOfExpressions',
              children: [
                {
                  kind: 'Assign',
                  address: expr.value['bindTo'],
                  value: {
                    kind: 'Local',
                    name: 'newValue',
                  },
                },
                {
                  kind: 'Intrinsic',
                  op: 'ForceRender',
                },
              ],
            },
          };
        }
        // Maybe wrap in function elsewhere
        return {
          kind: 'Function',
          parameters: [],
          body: {
            ...expr,
            value: {
              ...Object.fromEntries(
                Object.entries(expr.value)
                  .filter(([key]) => key != 'bindTo')
                  .map(([key, value]) => {
                    if (key == 'children') {
                      if (!Array.isArray(value)) {
                        throw new Error(
                          'Unreachable: children must have an array'
                        );
                      }
                      return [key, this.lowerArray(value, true)];
                    }
                    if (!value || Array.isArray(value)) {
                      throw new Error(
                        'Unreachable: props other than children must not be an array'
                      );
                    }
                    return [key, this.lowerSingle(value)];
                  })
              ),
              ...bindToProps,
              kind: expr.value.kind,
            },
          },
        };
      }
      case 'Import': {
        return expr;
      }
      case 'Export': {
        return {
          ...expr,
          expr: this.lowerSingle(expr.expr),
        };
      }
      case 'Comment': {
        if (expr.expr) {
          return this.lowerSingle(expr.expr);
        }
        return {
          kind: 'Literal',
          value: null,
          doRemoveFromBlock: true,
        };
      }
      case 'Switch': {
        const valueExpr: Expression = expr.value
          ? this.lowerSingle(expr.value)
          : { kind: 'Literal', location: expr.location, value: true };

        let node: Expression;
        if (expr.defaultBranch) {
          node = this.lowerSingle(expr.defaultBranch.value);
        } else {
          node = {
            kind: 'If',
            location: expr.location,
            condition: {
              kind: 'BinaryOperator',
              location: expr.location,
              operator: '===',
              left: valueExpr,
              right: this.lowerSingle(
                expr.branches[expr.branches.length - 1].comparator
              ),
            },
            ifTrue: this.lowerSingle(
              expr.branches[expr.branches.length - 1].value
            ),
            ifFalse: { kind: 'Literal', value: null },
          };
        }
        return expr.branches
          .slice()
          .reverse()
          .slice(expr.defaultBranch ? 0 : 1)
          .reduce((elseClause, branch) => {
            return {
              kind: 'If',
              location: expr.location,
              condition: {
                kind: 'BinaryOperator',
                location: expr.location,
                operator: '===',
                left: valueExpr,
                right: this.lowerSingle(branch.comparator),
              },
              ifTrue: this.lowerSingle(branch.value),
              ifFalse: elseClause,
            };
          }, node);
      }
      case 'Try': {
        return {
          ...expr,
          expr: this.lowerSingle(expr.expr, returnArrayFromBlock),
          catchBlock: expr.catchBlock
            ? this.lowerSingle(expr.catchBlock, returnArrayFromBlock)
            : undefined,
        };
      }
      case 'Intrinsic': {
        return expr;
      }
      default: {
        const exprNever: never = expr; // Error if missing node in switch
        throw new Error(
          'Failed to compile node with kind: ' + (exprNever as AnyForNever).kind
        );
      }
    }
  }

  private lowerBlockOfExpressions(
    block: ExpressionByKind['BlockOfExpressions'],
    returnArrayFromBlock: boolean
  ): ExpressionByKind['BlockOfExpressions'] {
    let loweredElements = block.children
      .map(expr => this.lowerSingle(expr, returnArrayFromBlock))
      .filter(removeNodes);

    if (returnArrayFromBlock) {
      loweredElements = [{ kind: 'Array', value: loweredElements }];
    }

    return {
      ...block,
      forceNotWidget: !returnArrayFromBlock,
      children: loweredElements,
    };
  }
}

export function lower(expr: Expression[]): Expression[] {
  return new Lowerer().lowerTopLevel(expr);
}

export function lowerForApp(expr: Expression[]): Expression[] {
  return new Lowerer().lowerForApp(expr);
}

function removeNodes(expr: Expression): boolean {
  return !(expr.kind == 'Literal' && !!expr.doRemoveFromBlock);
}
