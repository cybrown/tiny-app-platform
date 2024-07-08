import { BlockNode, Node, NodeLocation, FunctionNode } from 'tal-parser';
import { Program, AnyForNever } from './core';
import { buildOpcode, OpcodeByKind } from './opcodes';

export class Compiler {
  private functions: Program = {};

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

  appendOpcode<Kind extends keyof OpcodeByKind>(
    kind: Kind,
    location: NodeLocation | undefined,
    attrs: Omit<OpcodeByKind[Kind], 'kind'>
  ): void {
    this.functions[this.currentFunction].body[this.currentLabel].push(
      buildOpcode(kind, location, attrs)
    );
  }

  compileMain(value: Node | Node[]): Program {
    const nodeToCompile = Array.isArray(value) ? value : [value];

    for (let i = 0; i < nodeToCompile.length; i++) {
      const node = nodeToCompile[i];
      this.compile(node);
      if (i < nodeToCompile.length - 1) {
        this.appendOpcode('Pop', node.location, { inBlock: false });
      }
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

  compile(value: Node): void {
    switch (value.kind) {
      // Core interactions
      case 'Literal':
        this.appendOpcode('Literal', value.location, { value: value.value });
        break;
      case 'Array':
        for (let element of value.value) {
          this.compile(element);
        }
        this.appendOpcode('Literal', value.location, {
          value: value.value.length,
        });
        this.appendOpcode('MakeArray', value.location, {});
        break;
      case 'Record': {
        value.entries.flatMap(({ key, value }) => {
          this.appendOpcode('Literal', value.location, { value: key });
          this.compile(value);
        });
        this.appendOpcode('Literal', value.location, {
          value: value.entries.length,
        });
        this.appendOpcode('MakeRecord', value.location, {});
        break;
      }
      case 'Local':
        this.appendOpcode('Local', value.location, { name: value.name });
        break;
      case 'DeclareLocal':
        if (value.value) {
          this.compile(value.value);
        }
        this.appendOpcode('DeclareLocal', value.location, {
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
            this.appendOpcode('SetAttribute', value.location, {
              name: value.address.key,
              forceRender: true,
            });
            break;
          case 'Index':
            this.compile(value.address.index);
            this.compile(value.address.value);
            this.compile(value.value);
            this.appendOpcode('SetIndex', value.location, {
              forceRender: true,
            });
            break;
          case 'Local':
            this.compile(value.value);
            this.appendOpcode('SetLocal', value.location, {
              name: value.address.name,
            });
            break;
          default:
            throw new Error(
              'Failed to compile Assign node with address: ' +
                (value.address as AnyForNever).kind
            );
        }
        break;
      }
      case 'Function':
        const name = this.compileFunction(value);
        this.appendOpcode('FunctionRef', value.location, {
          name,
        });
        break;
      case 'Call': {
        const positionalArgs: Node[] = [];
        const namedArgs: [string, Node][] = [];

        // Seperate positional and named arguments
        value.args.forEach(arg => {
          if (arg.kind === 'NamedArgument') {
            namedArgs.push([arg.name, arg.value]);
          } else if (arg.kind == 'PositionalArgument') {
            positionalArgs.push(arg.value);
          }
        });

        // Emit positional arguments
        for (let arg of positionalArgs) {
          this.compile(arg);
        }
        this.appendOpcode('Literal', value.location, {
          value: positionalArgs.length,
        });
        this.appendOpcode('MakeArray', value.location, {});

        // Emit named arguments
        for (let [key, value] of namedArgs) {
          this.appendOpcode('Literal', value.location, { value: key });
          this.compile(value);
        }
        this.appendOpcode('Literal', value.location, {
          value: namedArgs.length,
        });
        this.appendOpcode('MakeRecord', value.location, {});

        // Emit function
        this.compile(value.value);

        this.appendOpcode('Call', value.location, {});
        break;
      }

      // Node
      case 'Attribute':
        this.compile(value.value);
        this.appendOpcode('Attribute', value.location, {
          name: value.key,
        });
        break;
      case 'Index':
        this.compile(value.index);
        this.compile(value.value);
        this.appendOpcode('Index', value.location, {});
        break;
      case 'If':
        this.compile(value.condition);
        const ifTrueLabel = this.makeLabel('if_true');
        const ifFalseLabel = this.makeLabel('if_false');
        const endIfLabel = this.makeLabel('if_end');
        this.appendOpcode('JumpTrue', value.location, {
          label: ifTrueLabel,
        });
        this.appendOpcode('Jump', value.location, {
          label: ifFalseLabel,
        });

        this.setCurrentLabel(ifTrueLabel);
        this.compile(value.ifTrue);
        this.appendOpcode('Jump', value.location, {
          label: endIfLabel,
        });

        this.setCurrentLabel(ifFalseLabel);
        if (value.ifFalse) {
          this.compile(value.ifFalse);
        }
        this.appendOpcode('Jump', value.location, {
          label: endIfLabel,
        });

        this.setCurrentLabel(endIfLabel);
        break;
      case 'Try':
        const catchLabel = this.makeLabel('try_catch');
        const endTryLabel = this.makeLabel('try_end');
        this.appendOpcode('Try', value.location, { catchLabel, endTryLabel });
        this.compile(value.node);
        this.appendOpcode('TryPop', value.location, {});
        this.appendOpcode('Jump', value.location, { label: endTryLabel });

        this.setCurrentLabel(catchLabel);
        if (value.catchNode) {
          this.appendOpcode('ScopeEnter', value.location, {});
          this.appendOpcode('PushLatestError', value.location, {});
          this.appendOpcode('DeclareLocal', value.location, {
            mutable: false,
            name: 'err',
            hasInitialValue: true,
          });
          this.appendOpcode('Pop', value.location, { inBlock: false });
          this.compile(value.catchNode);
          this.appendOpcode('ScopeLeave', value.location, {
            inBlock: false,
          });
        } else {
          this.appendOpcode('Literal', value.location, { value: null });
        }
        this.appendOpcode('Jump', value.location, { label: endTryLabel });

        this.setCurrentLabel(endTryLabel);
        break;
      case 'UnaryOperator':
        this.compile(value.operand);
        this.appendOpcode('Intrinsic', value.location, {
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
        this.appendOpcode('Intrinsic', value.location, {
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
      case 'Block':
        this.compileBlock(value);
        break;

      // UI Widgets
      case 'KindedRecord': {
        // Emit kind
        this.compile(value.kindOfRecord);

        // Emit children
        for (let child of value.children ?? []) {
          this.compile(child);
        }
        this.appendOpcode('Literal', value.location, {
          value: (value.children ?? []).length,
        });
        this.appendOpcode('MakeArray', value.location, {});

        // Emit props
        if (!value.entries) {
          console.log(value)
        }
        const propsToCompile = value.entries.filter(
          ({ key }) => !['ctx'].includes(key)
        );
        for (let { key, value } of propsToCompile) {
          if (!value || Array.isArray(value)) {
            throw new Error('Unreachable');
          }
          this.appendOpcode('Literal', value.location, { value: key });
          this.compile(value);
        }
        this.appendOpcode('Literal', value.location, {
          value: propsToCompile.length,
        });
        this.appendOpcode('MakeRecord', value.location, {});

        this.appendOpcode('Kinded', value.location, {});
        break;
      }
      case 'Import': {
        this.appendOpcode('Import', value.location, {
          path: value.path,
        });
        break;
      }
      case 'Export':
        throw new Error('Export node not supported');
      case 'Switch':
        throw new Error('Switch node not supported');
      case 'Comment':
        throw new Error('Comment node not supported');
      case 'Pipe':
        throw new Error('Pipe node not supported');
      case 'Nested':
        throw new Error('Nested node not supported');
      case 'Intrinsic': {
        switch (value.op) {
          case 'ForceRender': {
            this.appendOpcode('CtxRender', value.location, {});
            break;
          }
          default: {
            const opNever: never = value.op; // Error if missing intrinsic in switch
            throw new Error('Failed to compile intrinsic: ' + opNever);
          }
        }
        return;
      }
      case 'KindedRecordEntry':
      case 'NamedArgument':
      case 'PositionalArgument':
      case 'RecordEntry':
      case 'SwitchBranch':
        throw new Error('Unreachable node kind: ' + value.kind);
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

  private compileBlock(value: BlockNode, enterScope = true) {
    if (enterScope) {
      this.appendOpcode('ScopeEnter', value.location, {});
    }
    for (let i = 0; i < value.children.length; i++) {
      const node = value.children[i];
      this.compile(node);
      if (i < value.children.length - 1) {
        this.appendOpcode('Pop', value.location, {
          inBlock: !value.forceNotWidget,
        });
      }
    }
    if (enterScope) {
      this.appendOpcode('ScopeLeave', value.location, {
        inBlock: !value.forceNotWidget,
        count: value.children.length,
      });
    } else {
      this.appendOpcode('MakeArrayForBlock', value.location, {
        count: value.children.length,
      });
    }
  }

  private compileFunction(functionNode: FunctionNode): string {
    const funcName = this.createFunction(functionNode);

    const oldLabel = this.currentLabel;
    const oldFunction = this.currentFunction;

    this.currentLabel = 'entry';
    this.currentFunction = funcName;

    if (functionNode.body.kind === 'Block') {
      this.compileBlock(functionNode.body, false);
    } else {
      this.compile(functionNode.body);
    }

    this.currentFunction = oldFunction;
    this.currentLabel = oldLabel;

    return funcName;
  }

  private createFunction(functionNode: FunctionNode): string {
    const name =
      this.prefix +
      (functionNode.name ? functionNode.name + '_' : 'func_') +
      (this.functionIndexCounter++).toString(16);
    this.functions[name] = {
      parameters: functionNode.parameters.map(name => ({ name })),
      body: { entry: [] },
    };
    return name;
  }
}

export function compile(node: Node | Node[], prefix = ''): Program {
  const c = new Compiler(prefix);
  return c.compileMain(node);
}
