import {
  KindedRecordEntryNode,
  Node,
  NodeByKind,
  isAddressableNode,
} from 'tal-parser';
import { AnyForNever } from './core';

class Lowerer {
  public lowerTopLevel(node: Node[]): Node[] {
    const exportedNames: string[] = [];
    const result: Node[] = [];
    for (let n of node) {
      if (n.kind === 'Export') {
        if (n.node.kind !== 'DeclareLocal' || n.node.mutable) {
          throw new Error(
            'Only immutable values and function definitions can be exported'
          );
        }
        result.push(this.lowerSingle(n.node));
        exportedNames.push(n.node.name);
      } else {
        result.push(this.lowerSingle(n));
      }
    }
    if (exportedNames.length) {
      result.push({
        kind: 'Record',
        entries: exportedNames.map((name) => ({
          kind: 'RecordEntry',
          key: name,
          value: { kind: 'Local', name },
        })),
      });
    }
    return result;
  }

  public lowerArray(node: Node[], returnArrayFromBlock = false): Node[] {
    return node
      .map((e) => this.lowerSingle(e, returnArrayFromBlock))
      .filter(removeNodes);
  }

  public lowerSingle(node: Node, returnArrayFromBlock = false): Node {
    switch (node.kind) {
      case 'Literal': {
        return node;
      }
      case 'Local': {
        return node;
      }
      case 'Attribute': {
        return {
          ...node,
          value: this.lowerSingle(node.value),
        };
      }
      case 'Index': {
        return {
          ...node,
          index: this.lowerSingle(node.index),
          value: this.lowerSingle(node.value),
        };
      }
      case 'Array': {
        return {
          ...node,
          value: this.lowerArray(node.value),
        };
      }
      case 'If': {
        return {
          ...node,
          condition: this.lowerSingle(node.condition),
          ifTrue: this.lowerSingle(node.ifTrue, returnArrayFromBlock),
          ifFalse: node.ifFalse
            ? this.lowerSingle(node.ifFalse, returnArrayFromBlock)
            : { kind: 'Literal', value: null },
        };
      }
      case 'While': {
        return {
          ...node,
          condition: this.lowerSingle(node.condition),
          body: this.lowerSingle(node.body, returnArrayFromBlock),
        };
      }
      case 'Record': {
        return {
          ...node,
          entries: node.entries.map(({ key, value }) => ({
            kind: 'RecordEntry',
            key,
            value: this.lowerSingle(value),
          })),
        };
      }
      case 'Assign': {
        return {
          ...node,
          value: this.lowerSingle(node.value),
        };
      }
      case 'Function': {
        return {
          ...node,
          body: this.lowerSingle(node.body),
        };
      }
      case 'Call': {
        return {
          ...node,
          value: this.lowerSingle(node.value),
          args: node.args.map((arg) => ({
            ...arg,
            value: this.lowerSingle(arg.value),
          })),
        };
      }
      case 'Nested': {
        return this.lowerSingle(node.node);
      }
      case 'Pipe': {
        let [previous, current, ...rest] = [node.first, ...node.values];
        while (true) {
          if (current.kind === 'Call') {
            previous = {
              ...current,
              args: [
                { kind: 'PositionalArgument', value: previous },
                ...current.args,
              ],
            };
          } else {
            previous = {
              kind: 'Call',
              location: previous.location,
              value: current,
              args: [{ kind: 'PositionalArgument', value: previous }],
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
          ...node,
          operand: this.lowerSingle(node.operand),
        };
      }
      case 'BinaryOperator': {
        if (node.operator == '&&') {
          return {
            kind: 'Block',
            forceNotWidget: true,
            children: [
              {
                kind: 'DeclareLocal',
                mutable: false,
                location: node.location,
                value: this.lowerSingle(node.left),
                name: 'tmp_left',
              },
              {
                kind: 'If',
                location: node.location,
                condition: {
                  kind: 'Local',
                  name: 'tmp_left',
                  location: node.location,
                },
                ifTrue: this.lowerSingle(node.right),
                ifFalse: {
                  kind: 'Local',
                  name: 'tmp_left',
                  location: node.location,
                },
              },
            ],
          };
        }
        if (node.operator == '||') {
          return {
            kind: 'Block',
            forceNotWidget: true,
            children: [
              {
                kind: 'DeclareLocal',
                mutable: false,
                location: node.location,
                value: this.lowerSingle(node.left),
                name: 'tmp_left',
              },
              {
                kind: 'If',
                location: node.location,
                condition: {
                  kind: 'Local',
                  name: 'tmp_left',
                  location: node.location,
                },
                ifTrue: {
                  kind: 'Local',
                  name: 'tmp_left',
                  location: node.location,
                },
                ifFalse: this.lowerSingle(node.right),
              },
            ],
          };
        }
        return {
          ...node,
          left: this.lowerSingle(node.left),
          right: this.lowerSingle(node.right),
        };
      }
      case 'Block': {
        return this.lowerBlock(node, returnArrayFromBlock);
      }
      case 'DeclareLocal': {
        let value = null;
        if (node.value) {
          value = this.lowerSingle(node.value);
          if (value.kind == 'Function') {
            (value as any).name = node.name;
          }
        }
        return {
          ...node,
          ...(value ? { value } : {}),
        };
      }
      case 'KindedRecord': {
        const bindToEntries: KindedRecordEntryNode[] = [];
        const bindToEntry = node.entries.find(
          (entry) => entry.key === 'bindTo'
        );
        if (
          bindToEntry &&
          !Array.isArray(bindToEntry.value) &&
          isAddressableNode(bindToEntry.value)
        ) {
          bindToEntries.push({
            kind: 'KindedRecordEntry',
            key: 'value',
            value: bindToEntry.value,
          });
          bindToEntries.push({
            kind: 'KindedRecordEntry',
            key: 'onChange',
            value: {
              kind: 'Function',
              parameters: [
                { name: 'newValue', type: { kind: 'named', name: 'any' } },
              ],
              body: {
                kind: 'Block',
                children: [
                  {
                    kind: 'Assign',
                    address: bindToEntry.value,
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
            },
          });
        }
        // Maybe wrap in function elsewhere
        return {
          kind: 'Function',
          parameters: [],
          body: {
            ...node,
            kindOfRecord: this.lowerSingle(node.kindOfRecord),
            children: this.lowerArray(node.children, true),
            entries: [
              ...node.entries
                .filter(({ key }) => key != 'bindTo')
                .map(({ key, value }) => {
                  if (!value || Array.isArray(value)) {
                    throw new Error(
                      'Unreachable: props other than children must not be an array'
                    );
                  }
                  return {
                    kind: 'KindedRecordEntry' as const,
                    key,
                    value: this.lowerSingle(value),
                  };
                }),
              ...bindToEntries,
            ],
          },
        };
      }
      case 'Import': {
        return node;
      }
      case 'Export': {
        return {
          ...node,
          node: this.lowerSingle(node.node),
        };
      }
      case 'Comment': {
        if (node.node) {
          return this.lowerSingle(node.node);
        }
        return {
          kind: 'Literal',
          value: null,
          doRemoveFromBlock: true,
        };
      }
      case 'Switch': {
        const valueNode: Node = node.value
          ? this.lowerSingle(node.value)
          : { kind: 'Literal', location: node.location, value: true };

        let newNode: Node;
        if (node.defaultBranch) {
          newNode = this.lowerSingle(node.defaultBranch.value);
        } else {
          newNode = {
            kind: 'If',
            location: node.location,
            condition: {
              kind: 'BinaryOperator',
              location: node.location,
              operator: '==',
              left: valueNode,
              right: this.lowerSingle(
                node.branches[node.branches.length - 1].comparator
              ),
            },
            ifTrue: this.lowerSingle(
              node.branches[node.branches.length - 1].value
            ),
            ifFalse: { kind: 'Literal', value: null },
          };
        }
        return node.branches
          .slice()
          .reverse()
          .slice(node.defaultBranch ? 0 : 1)
          .reduce((elseClause, branch) => {
            return {
              kind: 'If',
              location: node.location,
              condition: {
                kind: 'BinaryOperator',
                location: node.location,
                operator: '==',
                left: valueNode,
                right: this.lowerSingle(branch.comparator),
              },
              ifTrue: this.lowerSingle(branch.value),
              ifFalse: elseClause,
            };
          }, newNode);
      }
      case 'Try': {
        return {
          ...node,
          node: this.lowerSingle(node.node, returnArrayFromBlock),
          catchNode: node.catchNode
            ? this.lowerSingle(node.catchNode, returnArrayFromBlock)
            : undefined,
        };
      }
      case 'Intrinsic': {
        return node;
      }
      case 'AttributeLambdaSugar': {
        return {
          ...node,
          kind: 'Function',
          parameters: [
            { name: '$$arg$$', type: { kind: 'named', name: 'any' } },
          ],
          body: {
            kind: 'Attribute',
            key: node.key,
            value: {
              kind: 'Local',
              name: '$$arg$$',
            },
          },
        };
      }
      case 'KindedRecordEntry':
      case 'RecordEntry':
      case 'NamedArgument':
      case 'PositionalArgument':
      case 'SwitchBranch':
        throw new Error(
          'Unreachable, node kind not expected here: ' + node.kind
        );
      default: {
        const _: never = node;
        _;
        throw new Error('Unreachable case: ' + (node as AnyForNever).kind);
      }
    }
  }

  private lowerBlock(
    block: NodeByKind['Block'],
    returnArrayFromBlock: boolean
  ): NodeByKind['Block'] {
    let loweredElements = block.children
      .map((node) => this.lowerSingle(node, returnArrayFromBlock))
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

export function lower(node: Node[]): Node[] {
  return new Lowerer().lowerTopLevel(node);
}

export function lowerSingle(node: Node): Node {
  return new Lowerer().lowerSingle(node);
}

function removeNodes(node: Node): boolean {
  return !(node.kind == 'Literal' && !!node.doRemoveFromBlock);
}
