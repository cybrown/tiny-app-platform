import { Expression, ExpressionLocation, FunctionExpression } from 'tal-parser';
import { Program, AnyForNever } from './core';
import { buildIRNode, IRNodeByKind } from './ir-node';

export class Compiler {
  private functions: Program = {};

  private namesToExport: Set<string> = new Set();

  private mainName: string;

  constructor(private prefix: string) {
    this.mainName = prefix + 'main';
    this.currentFunction = this.mainName;
    this.functions[this.currentFunction] = {
      parameters: [],
      body: { entry: [] },
    };
  }

  private currentFunction: string;

  private currentLabel: string = 'entry';

  appendIRNode<Kind extends keyof IRNodeByKind>(
    kind: Kind,
    location: ExpressionLocation | undefined,
    attrs: Omit<IRNodeByKind[Kind], 'kind'>
  ): void {
    this.functions[this.currentFunction].body[this.currentLabel].push(
      buildIRNode(kind, location, attrs)
    );
  }

  compileMain(value: Expression | Expression[]): Program {
    const expressionToCompile = Array.isArray(value) ? value : [value];

    for (let i = 0; i < expressionToCompile.length; i++) {
      const expr = expressionToCompile[i];
      this.compile(expr);
      if (i < expressionToCompile.length - 1) {
        this.appendIRNode('Pop', expr.location, {});
      }
    }

    if (this.namesToExport.size) {
      this.appendIRNode('Pop', expressionToCompile[0].location, {});
      for (let name of this.namesToExport) {
        this.appendIRNode('Literal', expressionToCompile[0].location, {
          value: name,
        });
        this.appendIRNode('Local', expressionToCompile[0].location, {
          name,
        });
      }
      this.appendIRNode('Literal', expressionToCompile[0].location, {
        value: this.namesToExport.size,
      });
      this.appendIRNode('MakeObject', expressionToCompile[0].location, {});
    }

    return this.functions;
  }

  private labelCount = 0;

  private makeLabel(desc: string): string {
    return desc + '_' + ++this.labelCount;
  }

  private setCurrentLabel(label: string): void {
    this.currentLabel = label;
    if (!this.functions[this.currentFunction].body[this.currentLabel]) {
      this.functions[this.currentFunction].body[this.currentLabel] = [];
    }
  }

  compile(value: Expression): void {
    switch (value.kind) {
      // Core interactions
      case 'Literal':
        this.appendIRNode('Literal', value.location, { value: value.value });
        break;
      case 'Array':
        for (let element of value.value) {
          this.compile(element);
        }
        this.appendIRNode('Literal', value.location, {
          value: value.value.length,
        });
        this.appendIRNode('MakeArray', value.location, {});
        break;
      case 'Object': {
        const entries = Object.entries(value.value);
        entries.flatMap(([key, value]) => {
          this.appendIRNode('Literal', value.location, { value: key });
          this.compile(value);
        });
        this.appendIRNode('Literal', value.location, {
          value: entries.length,
        });
        this.appendIRNode('MakeObject', value.location, {});
        break;
      }
      case 'Local':
        this.appendIRNode('Local', value.location, { name: value.name });
        break;
      case 'DeclareLocal':
        if (value.value) {
          this.compile(value.value);
        }
        this.appendIRNode('DeclareLocal', value.location, {
          name: value.name,
          mutable: value.mutable,
          hasInitialValue: !!value.value,
        });
        break;
      case 'Assign': {
        switch (value.address.kind) {
          case 'Attribute':
            this.compile(value.address.value);
            this.compile(value.value);
            this.appendIRNode('SetAttribute', value.location, {
              name: value.address.key,
              forceRender: true,
            });
            break;
          case 'Index':
            this.compile(value.address.index);
            this.compile(value.address.value);
            this.compile(value.value);
            this.appendIRNode('SetIndex', value.location, {
              forceRender: true,
            });
            break;
          case 'Local':
            this.compile(value.value);
            this.appendIRNode('SetLocal', value.location, {
              name: value.address.name,
            });
            break;
          default:
            throw new Error(
              'Failed to compile Assign expression with address: ' +
                (value.address as AnyForNever).kind
            );
        }
        break;
      }
      case 'Function':
        const name = this.compileFunction(value);
        this.appendIRNode('FunctionRef', value.location, {
          name,
        });
        break;
      case 'Call': {
        const positionalArgs: Expression[] = [];
        const namedArgs: [string, Expression][] = [];

        // Seperate positional and named arguments
        value.args.forEach(arg => {
          if (arg.argKind === 'Named') {
            namedArgs.push([arg.name, arg.value]);
          } else if (arg.argKind == 'Positional') {
            positionalArgs.push(arg.value);
          }
        });

        // Emit positional arguments
        for (let arg of positionalArgs) {
          this.compile(arg);
        }
        this.appendIRNode('Literal', value.location, {
          value: positionalArgs.length,
        });
        this.appendIRNode('MakeArray', value.location, {});

        // Emit named arguments
        for (let [key, value] of namedArgs) {
          this.appendIRNode('Literal', value.location, { value: key });
          this.compile(value);
        }
        this.appendIRNode('Literal', value.location, {
          value: namedArgs.length,
        });
        this.appendIRNode('MakeObject', value.location, {});

        // Emit function
        this.compile(value.value);

        this.appendIRNode('Call', value.location, {});
        break;
      }

      // Expression
      case 'Attribute':
        this.compile(value.value);
        this.appendIRNode('Attribute', value.location, {
          name: value.key,
        });
        break;
      case 'Index':
        this.compile(value.index);
        this.compile(value.value);
        this.appendIRNode('Index', value.location, {});
        break;
      case 'If':
        this.compile(value.condition);
        const ifTrueLabel = this.makeLabel('if_true');
        const ifFalseLabel = this.makeLabel('if_false');
        const endIfLabel = this.makeLabel('if_end');
        this.appendIRNode('JumpTrue', value.location, {
          label: ifTrueLabel,
        });
        this.appendIRNode('Jump', value.location, {
          label: ifFalseLabel,
        });

        this.setCurrentLabel(ifTrueLabel);
        this.compile(value.ifTrue);
        this.appendIRNode('Jump', value.location, {
          label: endIfLabel,
        });

        this.setCurrentLabel(ifFalseLabel);
        if (value.ifFalse) {
          this.compile(value.ifFalse);
        }
        this.appendIRNode('Jump', value.location, {
          label: endIfLabel,
        });

        this.setCurrentLabel(endIfLabel);
        break;
      case 'Try':
        const catchLabel = value.catchBlock ? this.makeLabel('try_catch') : undefined;
        const endTryLabel = this.makeLabel('try_end');
        this.appendIRNode('Try', value.location, { catchLabel, endTryLabel });
        this.compile(value.expr);
        this.appendIRNode('TryPop', value.location, {});
        this.appendIRNode('Jump', value.location, { label: endTryLabel });
        if (value.catchBlock && catchLabel) {
          this.setCurrentLabel(catchLabel);
          this.compile(value.catchBlock);
          this.appendIRNode('Jump', value.location, { label: endTryLabel });
        }
        this.setCurrentLabel(endTryLabel);
        break;
      case 'Provide':
        for (let entry of value.entries) {
          this.compile(entry.key);
          this.compile(entry.value);
        }
        this.appendIRNode('Literal', value.location, {
          value: value.entries.length,
        });
        this.appendIRNode('Provide', value.location, {});
        this.compile(value.body);
        for (let i = 0; i < value.entries.length; i++) {
          this.appendIRNode('ScopeLeave', value.location, {});
        }
        break;
      case 'Provided':
        this.compile(value.key);
        this.appendIRNode('GetProvided', value.location, {});
        break;
      case 'UnaryOperator':
        this.compile(value.operand);
        this.appendIRNode('Intrinsic', value.location, {
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
        });
        break;
      case 'BinaryOperator':
        this.compile(value.left);
        this.compile(value.right);
        this.appendIRNode('Intrinsic', value.location, {
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
        break;
      case 'BlockOfExpressions':
        this.appendIRNode('ScopeEnter', value.location, {});
        for (let i = 0; i < value.children.length; i++) {
          const expr = value.children[i];
          this.compile(expr);
          if (i < value.children.length - 1) {
            this.appendIRNode('Pop', value.location, {});
          }
        }
        this.appendIRNode('ScopeLeave', value.location, {});
        break;

      // UI Widgets
      case 'KindedObject': {
        const valueAsUiWidget = value.value;

        // Emit kind
        this.compile(valueAsUiWidget.kind);

        // Emit children
        for (let child of valueAsUiWidget.children ?? []) {
          this.compile(child);
        }
        this.appendIRNode('Literal', value.location, {
          value: (valueAsUiWidget.children ?? []).length,
        });
        this.appendIRNode('MakeArray', value.location, {});

        // Emit props
        const propsToCompile = Object.entries(valueAsUiWidget).filter(
          ([key]) => !['kind', 'ctx', 'children'].includes(key)
        );
        for (let [key, value] of propsToCompile) {
          if (!value || Array.isArray(value)) {
            throw new Error('Unreachable');
          }
          this.appendIRNode('Literal', value.location, { value: key });
          this.compile(value);
        }
        this.appendIRNode('Literal', value.location, {
          value: propsToCompile.length,
        });
        this.appendIRNode('MakeObject', value.location, {});

        this.appendIRNode('Kinded', value.location, {});
        break;
      }
      case 'Import': {
        this.appendIRNode('Import', value.location, {
          path: value.path,
        });
        break;
      }
      case 'Export': {
        switch (value.expr.kind) {
          case 'DeclareLocal': {
            if (value.expr.mutable) {
              throw new Error('Mutable variables can not be exported');
            }
            this.namesToExport.add(value.expr.name);
            this.compile(value.expr);
            break;
          }
          default:
            throw new Error(
              'Only immutable values and function definitions can be exported'
            );
        }
        break;
      }
      case 'Switch':
        throw new Error('Switch expression not supported');
      case 'Comment':
        throw new Error('Comment expression not supported');
      case 'Pipe':
        throw new Error('Pipe expression not supported');
      case 'SubExpression':
        throw new Error('SubExpression expression not supported');
      case 'Intrinsic': {
        switch (value.op) {
          case 'ForceRender': {
            this.appendIRNode('CtxRender', value.location, {});
            break;
          }
          default: {
            const opNever: never = value.op; // Error if missing intrinsic in switch
            throw new Error('Failed to compile intrinsic: ' + opNever);
          }
        }
        return;
      }
      default: {
        const valueNever: never = value; // Error if missing node in switch
        throw new Error(
          'Failed to compile node with kind: ' +
            (valueNever as AnyForNever).kind
        );
      }
    }
  }

  private functionIndexCounter = 0;

  private compileFunction(functionExpression: FunctionExpression): string {
    const funcName = this.createFunction(functionExpression);

    const oldLabel = this.currentLabel;
    const oldFunction = this.currentFunction;

    this.currentLabel = 'entry';
    this.currentFunction = funcName;

    this.compile(functionExpression.body);

    this.currentFunction = oldFunction;
    this.currentLabel = oldLabel;

    return funcName;
  }

  private createFunction(functionExpression: FunctionExpression): string {
    const name =
      this.prefix +
      (functionExpression.name ? functionExpression.name + '_' : 'func_') +
      (this.functionIndexCounter++).toString(16);
    this.functions[name] = {
      parameters: functionExpression.parameters.map(name => ({ name })),
      body: { entry: [] },
    };
    return name;
  }
}

export function compile(expr: Expression | Expression[], prefix = ''): Program {
  const c = new Compiler(prefix);
  return c.compileMain(expr);
}
