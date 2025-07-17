import { Type } from './types';

export type SymbolDeclaration = {
  type: Type;
  mutable: boolean;
};

type SymbolTableContent = Record<string, SymbolDeclaration>;
type TypeAliasSymbolTableContent = Record<string, Type>;

export class SymbolTable {
  private symbols: SymbolTableContent = {};
  private typeAliasSymbols: TypeAliasSymbolTableContent = {};
  private stack: [SymbolTableContent, TypeAliasSymbolTableContent][] = [[this.symbols, this.typeAliasSymbols]];

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
    this.stack.shift();
    this.symbols = this.stack[0][0];
    this.typeAliasSymbols = this.stack[0][1];
  }
}
