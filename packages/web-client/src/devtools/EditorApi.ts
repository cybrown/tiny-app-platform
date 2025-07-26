export interface EditorApi {
  // Misc features
  undo(): void;
  redo(): void;

  // Read features
  getSource(): string;
  // Depreciate this method and use getSelectionRanges instead
  getCusorPositions():
    | { offset: number; line: number; column: number; isRange: boolean }[]
    | null;
  getSelectionRanges(): {
    from: number;
    to: number;
  }[];

  // Write features
  replaceSelection(text: string): void;
  replaceAll(text: string): void;
  replaceAtRange(text: string, from: number, to: number): void;
  setSelectionRange(from: number, to: number): void;
  replaceMultipleAtRange(
    replacement: { from: number; to: number; text: string }[]
  ): void;
}
