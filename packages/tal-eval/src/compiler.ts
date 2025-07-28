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
    const lastOpcode =
      this.functions[this.currentFunction].body[this.currentLabel].at(-1);

    if (lastOpcode?.kind !== 'Jump') {
      throw new Error(
        'Do not create a new label after a non block terminating opcode'
      );
    }

    this.currentLabel = label;
    if (!this.functions[this.currentFunction].body[this.currentLabel]) {
      this.functions[this.currentFunction].body[this.currentLabel] = [];
    }
  }

  compile(node: Node): void {
    switch (node.kind) {
      // Core interactions
      case 'Literal':
        this.appendOpcode('Literal', node.location, { value: node.value });
        break;
      case 'Array':
        for (let element of node.value) {
          this.compile(element);
        }
        this.appendOpcode('Literal', node.location, {
          value: node.value.length,
        });
        this.appendOpcode('MakeArray', node.location, {});
        break;
      case 'Record': {
        node.entries.flatMap(({ key, value }) => {
          this.appendOpcode('Literal', value.location, { value: key });
          this.compile(value);
        });
        this.appendOpcode('Literal', node.location, {
          value: node.entries.length,
        });
        this.appendOpcode('MakeRecord', node.location, {});
        break;
      }
      case 'Local':
        this.appendOpcode('Local', node.location, { name: node.name });
        break;
      case 'DeclareLocal':
        if (node.value) {
          this.compile(node.value);
        }
        this.appendOpcode('DeclareLocal', node.location, {
          name: node.name,
          mutable: node.mutable,
          hasInitialValue: !!node.value,
        });
        break;
      case 'Assign': {
        switch (node.address.kind) {
          case 'Attribute':
            this.compile(node.address.value);
            this.compile(node.value);
            this.appendOpcode('SetAttribute', node.location, {
              name: node.address.key.name,
              forceRender: true,
            });
            break;
          case 'Index':
            this.compile(node.address.index);
            this.compile(node.address.value);
            this.compile(node.value);
            this.appendOpcode('SetIndex', node.location, {
              forceRender: true,
            });
            break;
          case 'Local':
            this.compile(node.value);
            this.appendOpcode('SetLocal', node.location, {
              name: node.address.name,
            });
            break;
          default:
            throw new Error(
              'Failed to compile Assign node with address: ' +
                (node.address as AnyForNever).kind
            );
        }
        break;
      }
      case 'Function':
        const name = this.compileFunction(node);
        this.appendOpcode('FunctionRef', node.location, {
          name,
        });
        break;
      case 'Call': {
        const positionalArgs: Node[] = [];
        const namedArgs: [string, Node][] = [];

        // Seperate positional and named arguments
        node.args.forEach((arg) => {
          if (arg.kind === 'NamedArgument') {
            namedArgs.push([arg.name.name, arg.value]);
          } else if (arg.kind == 'PositionalArgument') {
            positionalArgs.push(arg.value);
          }
        });

        // Emit positional arguments
        for (let arg of positionalArgs) {
          this.compile(arg);
        }
        this.appendOpcode('Literal', node.location, {
          value: positionalArgs.length,
        });
        this.appendOpcode('MakeArray', node.location, {});

        // Emit named arguments
        for (let [key, value] of namedArgs) {
          this.appendOpcode('Literal', value.location, { value: key });
          this.compile(value);
        }
        this.appendOpcode('Literal', node.location, {
          value: namedArgs.length,
        });
        this.appendOpcode('MakeRecord', node.location, {});

        // Emit function
        this.compile(node.value);

        this.appendOpcode('Call', node.location, {});
        break;
      }

      // Node
      case 'Attribute':
        this.compile(node.value);
        this.appendOpcode('Attribute', node.location, {
          name: node.key.name,
        });
        break;
      case 'Index':
        this.compile(node.index);
        this.compile(node.value);
        this.appendOpcode('Index', node.location, {});
        break;
      case 'If':
        this.compile(node.condition);
        const ifTrueLabel = this.makeLabel('if_true');
        const ifFalseLabel = this.makeLabel('if_false');
        const endIfLabel = this.makeLabel('if_end');
        this.appendOpcode('JumpTrue', node.location, {
          label: ifTrueLabel,
        });
        this.appendOpcode('Jump', node.location, {
          label: ifFalseLabel,
        });

        this.setCurrentLabel(ifTrueLabel);
        this.compile(node.ifTrue);
        this.appendOpcode('Jump', node.location, {
          label: endIfLabel,
        });

        this.setCurrentLabel(ifFalseLabel);
        if (node.ifFalse) {
          this.compile(node.ifFalse);
        }
        this.appendOpcode('Jump', node.location, {
          label: endIfLabel,
        });

        this.setCurrentLabel(endIfLabel);
        break;
      case 'While':
        const whileConditionLabel = this.makeLabel('while_condition');
        const whileBodyLabel = this.makeLabel('while_body');
        const whileEndLabel = this.makeLabel('while_end');

        // Default value if loop is never executed
        this.appendOpcode('Literal', node.location, {
          value: null,
        });

        this.appendOpcode('Jump', node.location, {
          label: whileConditionLabel,
        });

        this.setCurrentLabel(whileConditionLabel);
        this.compile(node.condition);
        this.appendOpcode('JumpTrue', node.location, {
          label: whileBodyLabel,
        });
        this.appendOpcode('Jump', node.location, {
          label: whileEndLabel,
        });

        this.setCurrentLabel(whileBodyLabel);
        // Remove value pushed by previous iteration, or default null value
        this.appendOpcode('Pop', node.location, { inBlock: false });
        this.compile(node.body);
        this.appendOpcode('Jump', node.location, {
          label: whileConditionLabel,
        });

        this.setCurrentLabel(whileEndLabel);
        break;
      case 'Try':
        const catchLabel = this.makeLabel('try_catch');
        const endTryLabel = this.makeLabel('try_end');
        this.appendOpcode('Try', node.location, { catchLabel, endTryLabel });
        this.compile(node.node);
        this.appendOpcode('TryPop', node.location, {});
        this.appendOpcode('Jump', node.location, { label: endTryLabel });

        this.setCurrentLabel(catchLabel);
        if (node.catchNode) {
          this.appendOpcode('ScopeEnter', node.location, {});
          this.appendOpcode('PushLatestError', node.location, {});
          this.appendOpcode('DeclareLocal', node.location, {
            mutable: false,
            name: 'err',
            hasInitialValue: true,
          });
          this.appendOpcode('Pop', node.location, { inBlock: false });
          this.compile(node.catchNode);
          this.appendOpcode('ScopeLeave', node.location, {
            inBlock: false,
          });
        } else {
          this.appendOpcode('Literal', node.location, { value: null });
        }
        this.appendOpcode('Jump', node.location, { label: endTryLabel });

        this.setCurrentLabel(endTryLabel);
        break;
      case 'UnaryOperator':
        this.compile(node.operand);
        this.appendOpcode('Intrinsic', node.location, {
          operation: (() => {
            switch (node.operator) {
              case '-':
                return 'INTRINSIC_NEGATE';
              case '+':
                return 'INTRINSIC_POSITIF';
              case '!':
                return 'INTRINSIC_NOT';
              default:
                throw new Error(
                  'Unknown unary operator: ' + (node as AnyForNever).operator
                );
            }
          })(),
        });
        break;
      case 'BinaryOperator':
        this.compile(node.left);
        this.compile(node.right);
        this.appendOpcode('Intrinsic', node.location, {
          operation: (() => {
            switch (node.operator) {
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
              default:
                throw new Error(
                  'Unknown binary operator: ' + (node as AnyForNever).operator
                );
            }
          })(),
        });
        break;
      case 'Block':
        this.compileBlock(node);
        break;

      // UI Widgets
      case 'KindedRecord': {
        // Emit kind
        this.compile(node.kindOfRecord);

        // Emit children
        for (let child of node.children ?? []) {
          this.compile(child);
        }
        this.appendOpcode('Literal', node.location, {
          value: (node.children ?? []).length,
        });
        this.appendOpcode('MakeArray', node.location, {});

        // Emit props
        if (!node.entries) {
          console.log(node);
        }
        const propsToCompile = node.entries.filter(
          ({ key }) => !['ctx'].includes(key)
        );
        for (let { key, value } of propsToCompile) {
          if (!value || Array.isArray(value)) {
            throw new Error('Unreachable');
          }
          this.appendOpcode('Literal', value.location, { value: key });
          this.compile(value);
        }
        this.appendOpcode('Literal', node.location, {
          value: propsToCompile.length,
        });
        this.appendOpcode('MakeRecord', node.location, {});

        this.appendOpcode('Kinded', node.location, {});
        break;
      }
      case 'Import': {
        this.appendOpcode('Import', node.location, {
          path: node.path,
        });
        break;
      }
      case 'Intrinsic': {
        switch (node.op) {
          case 'ForceRender': {
            this.appendOpcode('CtxRender', node.location, {});
            break;
          }
          default: {
            const _: never = node.op;
            _;
            throw new Error('Unreachable case: ' + (node.op as any).kind);
          }
        }
        return;
      }
      case 'TypeAlias':
        // Type aliases are not compiled, they are only used for type checking
        return;
      case 'Export':
      case 'Switch':
      case 'Comment':
      case 'Pipe':
      case 'Nested':
      case 'KindedRecordEntry':
      case 'NamedArgument':
      case 'PositionalArgument':
      case 'RecordEntry':
      case 'SwitchBranch':
      case 'AttributeLambdaSugar':
      case 'Identifier':
        throw new Error('Unreachable node kind: ' + node.kind);
      default: {
        const _: never = node;
        _;
        throw new Error('Unreachable case: ' + (node as AnyForNever).kind);
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
      parameters: functionNode.parameters.map((parameter) => ({
        name: parameter.name.name,
      })),
      body: { entry: [] },
    };
    return name;
  }
}

export function compile(node: Node | Node[], prefix = ''): Program {
  const c = new Compiler(prefix);
  return c.compileMain(node);
}
