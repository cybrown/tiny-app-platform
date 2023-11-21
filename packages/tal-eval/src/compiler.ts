import { Expression, FunctionExpression } from 'tal-parser';
import {
  IRNode,
  buildIRNode,
  Program,
  ParameterDef,
  AnyForNever,
} from './core';

export class Compiler {
  private functions: Program = {};

  compileMain(value: Expression | Expression[]): Program {
    return {
      ...this.functions,
      main: {
        parameters: [],
        body: Array.isArray(value)
          ? buildIRNode('BLOCK', value[0].location, {
              children: value.map(a => this.compile(a)),
            })
          : this.compile(value),
      },
    };
  }

  compile(value: Expression): IRNode {
    switch (value.kind) {
      // Core interactions
      case 'Literal':
        return buildIRNode('LITERAL', value.location, { value: value.value });
      case 'Array':
        return buildIRNode('MAKE_ARRAY', value.location, {
          children: value.value.map(element => this.compile(element)),
        });
      case 'Object':
        return buildIRNode('MAKE_OBJECT', value.location, {
          children: Object.entries(value.value).flatMap(([key, value]) => [
            buildIRNode('LITERAL', value.location, { value: key }),
            this.compile(value),
          ]),
        });
      case 'Local':
        return buildIRNode('LOCAL', value.location, { name: value.name });
      case 'DeclareLocal':
        return buildIRNode('DECLARE_LOCAL', value.location, {
          name: value.name,
          mutable: value.mutable,
          children: value.value ? [this.compile(value.value)] : [],
        });
      case 'Assign': {
        switch (value.address.kind) {
          case 'Attribute':
            return buildIRNode('SET_ATTRIBUTE', value.location, {
              name: value.address.key,
              forceRender: true,
              children: [
                this.compile(value.address.value),
                this.compile(value.value),
              ],
            });
          case 'Index':
            return buildIRNode('SET_INDEX', value.location, {
              forceRender: true,
              children: [
                this.compile(value.address.index),
                this.compile(value.address.value),
                this.compile(value.value),
              ],
            });
          case 'Local':
            return buildIRNode('SET_LOCAL', value.location, {
              name: value.address.name,
              children: [this.compile(value.value)],
            });
          default:
            throw new Error(
              'Failed to compile Assign expression with address: ' +
                (value.address as AnyForNever).kind
            );
        }
      }
      case 'Function':
        return buildIRNode('FUNCTION_REF', value.location, {
          name: this.compileFunction(value),
        });
      case 'Call': {
        const positionalArgs: Expression[] = [];
        const namedArgs: [string, Expression][] = [];

        value.args.forEach(arg => {
          if (arg.argKind === 'Named') {
            namedArgs.push([arg.name, arg.value]);
          } else if (arg.argKind == 'Positional') {
            positionalArgs.push(arg.value);
          }
        });

        const positionalArgsIr = buildIRNode('MAKE_ARRAY', value.location, {
          children: positionalArgs.map(arg => this.compile(arg)),
        });

        const namedArgsIr = buildIRNode('MAKE_OBJECT', value.location, {
          children: namedArgs.flatMap(([key, value]) => [
            buildIRNode('LITERAL', value.location, { value: key }),
            this.compile(value),
          ]),
        });

        return buildIRNode('CALL', value.location, {
          children: [this.compile(value.value), positionalArgsIr, namedArgsIr],
        });
      }

      // Expression
      case 'SubExpression':
        return this.compile(value.expr);
      case 'Attribute':
        return buildIRNode('ATTRIBUTE', value.location, {
          name: value.key,
          children: [this.compile(value.value)],
        });
      case 'Index':
        return buildIRNode('INDEX', value.location, {
          children: [this.compile(value.index), this.compile(value.value)],
        });
      case 'If':
        return buildIRNode('CONDITION', value.location, {
          children: [
            this.compile(value.condition),
            this.compile(value.ifTrue),
            ...(value.ifFalse ? [this.compile(value.ifFalse)] : []),
          ],
        });
      case 'Try':
        return buildIRNode('TRY', value.location, {
          children: [
            this.compile(value.expr),
            ...(value.catchBlock ? [this.compile(value.catchBlock)] : []),
          ],
        });
      case 'Pipe':
        let [previous, current, ...rest] = [
          value.first,
          ...value.values.map(a => a.value),
        ];
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
        return this.compile(previous);
      case 'UnaryOperator':
        return buildIRNode('INTRINSIC', value.location, {
          operation: (() => {
            switch (value.operator) {
              case '-':
                return 'INTRINSIC_NEGATE';
              case '+':
                return 'INTRINSIC_POSITIF';
              case '!':
                return 'INTRINSIC_NOT';
              default:
                throw new Error(
                  'Unknown unary operator: ' + (value as AnyForNever).operator
                );
            }
          })(),
          children: [this.compile(value.operand)],
        });
      case 'BinaryOperator':
        if (value.operator == '&&') {
          const leftIr = this.compile(value.left);
          return buildIRNode('BLOCK', value.location, {
            children: [
              buildIRNode('DECLARE_LOCAL', value.location, {
                mutable: false,
                name: 'tmp_for_and',
                children: [leftIr],
              }),
              buildIRNode('CONDITION', value.location, {
                children: [
                  buildIRNode('LOCAL', value.location, { name: 'tmp_for_and' }),
                  this.compile(value.right),
                  this.compile(value.left),
                ],
              }),
            ],
          });
        }
        if (value.operator == '||') {
          const leftIr = this.compile(value.left);
          return buildIRNode('BLOCK', value.location, {
            children: [
              buildIRNode('DECLARE_LOCAL', value.location, {
                mutable: false,
                name: 'tmp_for_or',
                children: [leftIr],
              }),
              buildIRNode('CONDITION', value.location, {
                children: [
                  buildIRNode('LOCAL', value.location, { name: 'tmp_for_or' }),
                  this.compile(value.left),
                  this.compile(value.right),
                ],
              }),
            ],
          });
        }
        return buildIRNode('INTRINSIC', value.location, {
          children: [this.compile(value.left), this.compile(value.right)],
          operation: (() => {
            switch (value.operator) {
              case '*':
                return 'INTRINSIC_MULTIPLY';
              case '/':
                return 'INTRINSIC_DIVIDE';
              case '%':
                return 'INTRINSIC_MODULO';
              case '+':
                return 'INTRINSIC_ADD';
              case '-':
                return 'INTRINSIC_SUBSTRACT';
              case '<':
                return 'INTRINSIC_LESSER';
              case '<=':
                return 'INTRINSIC_LESSER_OR_EQUAL';
              case '>':
                return 'INTRINSIC_GREATER';
              case '>=':
                return 'INTRINSIC_GREATER_OR_EQUAL';
              case '==':
                return 'INTRINSIC_EQUAL';
              case '!=':
                return 'INTRINSIC_NOT_EQUAL';
              case '===':
                return 'INTRINSIC_EQUAL_STRICT';
              case '!==':
                return 'INTRINSIC_NOT_EQUAL_STRICT';
              default:
                throw new Error(
                  'Unknown binary operator: ' + (value as AnyForNever).operator
                );
            }
          })(),
        });
      case 'BlockOfExpressions':
        return buildIRNode('BLOCK', value.location, {
          children: value.children.map(expr => this.compile(expr)),
        });

      // UI Widgets
      case 'KindedObject': {
        const valueAsUiWidget = value.value as any;

        const childrenArray = buildIRNode('MAKE_ARRAY', value.location, {
          children: (valueAsUiWidget.children ?? []).map((arg: any) =>
            this.compile(arg)
          ),
        });
        const propsObjectIr = buildIRNode('MAKE_OBJECT', value.location, {
          children: Object.entries(valueAsUiWidget)
            .filter(([key]) => !['kind', 'ctx', 'children'].includes(key))
            .flatMap(([key, value]: [any, any]) => {
              if (key == 'bindTo') {
                return [
                  buildIRNode('LITERAL', value.location, { value: 'onChange' }),
                  buildIRNode('FUNCTION_REF', value.location, {
                    name: this.createFunction(
                      [{ name: 'newValue' }],
                      buildIRNode('BLOCK', value.location, {
                        children: [
                          this.compile({
                            kind: 'Assign',
                            address: value,
                            value: {
                              kind: 'Local',
                              name: 'newValue',
                            },
                          }),
                          buildIRNode('CTX_RENDER', value.location, {}),
                        ],
                      })
                    ),
                  }),
                  buildIRNode('LITERAL', value.location, { value: 'value' }),
                  this.compile(value),
                ];
              }
              return [
                buildIRNode('LITERAL', value.location, { value: key }),
                this.compile(value),
              ];
            }),
        });

        return buildIRNode('KINDED', value.location, {
          children: [
            buildIRNode('LITERAL', value.location, {
              value: valueAsUiWidget.kind,
            }),
            childrenArray,
            propsObjectIr,
          ],
        });
      }
      default: {
        throw new Error(
          'Failed to compile node with kind: ' + (value as AnyForNever).kind
        );
      }
    }
  }

  private functionIndexCounter = 0;

  private compileFunction(functionExpression: FunctionExpression): string {
    return this.createFunction(
      functionExpression.parameters.map(name => ({ name })),
      this.compile(functionExpression.body)
    );
  }

  private createFunction(parameters: ParameterDef[], body: IRNode): string {
    const name = 'func_' + (this.functionIndexCounter++).toString(16);
    this.functions[name] = { parameters, body };
    return name;
  }
}

export function compile(expr: Expression | Expression[]): Program {
  const c = new Compiler();
  return c.compileMain(expr);
}
