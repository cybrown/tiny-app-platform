import { Type } from './types';

export type SymbolDeclaration = {
  type: Type;
  mutable: boolean;
};

type SymbolTableContent = Record<string, SymbolDeclaration>;
type TypeAliasSymbolTableContent = Record<string, Type>;
type LateInitResult =
  | {
      success: true;
      type: Type;
    }
  | { success: false };

const LateInitResult_SUCCESS = (type: Type): LateInitResult => ({
  success: true,
  type,
});
const LateInitResult_FAILURE: LateInitResult = {
  success: false,
};

export class SymbolTable {
  private symbols: SymbolTableContent = {};
  private typeAliasSymbols: TypeAliasSymbolTableContent = {};
  private stack: [SymbolTableContent, TypeAliasSymbolTableContent][] = [
    [this.symbols, this.typeAliasSymbols],
  ];

  public declare(name: string, type: Type, mutable: boolean): boolean {
    if (Object.hasOwn(this.symbols, name)) {
      return false;
    }
    this.symbols[name] = { type, mutable };
    return true;
  }

  public declareTypeAlias(name: string, type: Type): boolean {
    if (Object.hasOwn(this.symbols, name)) {
      return false;
    }
    this.typeAliasSymbols[name] = type;
    return true;
  }

  public declareLateInit(name: string, type: Type): LateInitResult {
    for (const s of this.stack) {
      if (Object.hasOwn(s[1], name)) {
        if (s[1][name].kind == 'generic-placeholder-late-init') {
          // Replace type in symbol table, but also refer type in late init
          // type because some references are not updated elsewhere
          // Maybe in the future do not change symbol table and only update late init type
          s[1][name].type = type;
          s[1][name] = type;
          return LateInitResult_SUCCESS(type);
        } else {
          return LateInitResult_SUCCESS(s[1][name]);
        }
      }
    }
    return LateInitResult_FAILURE;
  }

  public get(name: string): SymbolDeclaration | null {
    for (let ctx of this.stack) {
      if (Object.hasOwn(ctx[0], name)) {
        return ctx[0][name];
      }
    }
    return null;
  }

  public getTypeAlias(name: string): Type | null {
    for (let ctx of this.stack) {
      if (Object.hasOwn(ctx[1], name)) {
        return ctx[1][name];
      }
    }
    return null;
  }

  public push(): void {
    this.symbols = {};
    this.typeAliasSymbols = {};
    this.stack.unshift([this.symbols, this.typeAliasSymbols]);
  }

  public pop(): void {
    if (this.stack.length <= 1) {
      throw new Error('Symbol table underflow');
    }
    // TODO: Return an error to not interupt type check
    for (const [name, type] of Object.entries(this.typeAliasSymbols)) {
      if (type.kind == 'generic-placeholder-late-init') {
        throw new Error('Late init not init detected', this.typeAliasSymbols);
      }
    }
    this.stack.shift();
    this.symbols = this.stack[0][0];
    this.typeAliasSymbols = this.stack[0][1];
  }
}
