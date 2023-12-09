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

  private namesToExport: Set<string> = new Set();

  constructor(private prefix: string) {}

  compileMain(value: Expression | Expression[]): Program {
    const expressionToCompile = Array.isArray(value) ? value : [value];
    const body = buildIRNode(
      'BLOCK',
      expressionToCompile.length ? expressionToCompile[0].location : undefined,
      {
        children: [
          ...expressionToCompile.map(a => this.compile(a)),
          ...(this.namesToExport.size
            ? [
                buildIRNode('MAKE_OBJECT', expressionToCompile[0].location, {
                  children: Array.from(this.namesToExport).flatMap(name => {
                    return [
                      buildIRNode('LITERAL', expressionToCompile[0].location, {
                        value: name,
                      }),
                      buildIRNode('LOCAL', expressionToCompile[0].location, {
                        name,
                      }),
                    ];
                  }),
                }),
              ]
            : []),
        ],
      }
    );
    return {
      ...this.functions,
      main: {
        parameters: [],
        body,
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
      case 'Switch': {
        const valueIRNode = value.value
          ? this.compile(value.value)
          : buildIRNode('LITERAL', value.location, {
              value: true,
            });
        let node: IRNode;
        if (value.defaultBranch) {
          node = this.compile(value.defaultBranch.value);
        } else {
          node = buildIRNode('CONDITION', value.location, {
            children: [
              buildIRNode('INTRINSIC', value.location, {
                operation: 'INTRINSIC_EQUAL_STRICT',
                children: [
                  valueIRNode,
                  this.compile(
                    value.branches[value.branches.length - 1].comparator
                  ),
                ],
              }),
              this.compile(value.branches[value.branches.length - 1].value),
            ],
          });
        }
        return value.branches
          .slice()
          .reverse()
          .slice(value.defaultBranch ? 0 : 1)
          .reduce((elseClause, branch) => {
            return buildIRNode('CONDITION', value.location, {
              children: [
                buildIRNode('INTRINSIC', value.location, {
                  operation: 'INTRINSIC_EQUAL_STRICT',
                  children: [valueIRNode, this.compile(branch.comparator)],
                }),
                this.compile(branch.value),
                elseClause,
              ],
            });
          }, node);
      }
      case 'Try':
        return buildIRNode('TRY', value.location, {
          children: [
            this.compile(value.expr),
            ...(value.catchBlock ? [this.compile(value.catchBlock)] : []),
          ],
        });
      case 'Provide':
        return value.entries.reduce((prev, entry) => {
          return buildIRNode('PROVIDE', value.location, {
            children: [
              this.compile(entry.key),
              this.compile(entry.value),
              prev,
            ],
          });
        }, this.compile(value.body));
      case 'Provided':
        return buildIRNode('PROVIDED', value.location, {
          children: [this.compile(value.key)],
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
            this.compile(valueAsUiWidget.kind),
            childrenArray,
            propsObjectIr,
          ],
        });
      }
      case 'Import': {
        return buildIRNode('IMPORT', value.location, {
          path: value.path,
        });
      }
      case 'Export': {
        switch (value.expr.kind) {
          case 'DeclareLocal': {
            if (value.expr.mutable) {
              throw new Error('Mutable variables can not be exported');
            }
            this.namesToExport.add(value.expr.name);
            return this.compile(value.expr);
          }
          default:
            throw new Error(
              'Only immutable values and function definitions can be exported'
            );
        }
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
    const name =
      this.prefix + 'func_' + (this.functionIndexCounter++).toString(16);
    this.functions[name] = { parameters, body };
    return name;
  }
}

export function compile(expr: Expression | Expression[], prefix = ''): Program {
  const c = new Compiler(prefix);
  return c.compileMain(expr);
}
