import { Type } from './types';

export type SymbolDeclaration = {
  type: Type;
  mutable: boolean;
};

export class SymbolTable {
  private symbols: Record<string, SymbolDeclaration> = {};
  private stack: Record<string, SymbolDeclaration>[] = [this.symbols];

  public declare(name: string, type: Type, mutable: boolean): boolean {
    if (Object.hasOwn(this.symbols, name)) {
      return false;
    }
    this.symbols[name] = { type, mutable };
    return true;
  }

  public get(name: string): SymbolDeclaration | null {
    for (let ctx of this.stack) {
      if (Object.hasOwn(ctx, name)) {
        return ctx[name];
      }
    }
    return null;
  }

  public push(): void {
    this.symbols = {};
    this.stack.unshift(this.symbols);
  }

  public pop(): void {
    if (this.stack.length <= 1) {
      throw new Error('Symbol table underflow');
    }
    this.stack.shift();
    this.symbols = this.stack[0];
  }
}
