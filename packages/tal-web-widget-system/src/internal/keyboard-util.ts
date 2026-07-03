export type ShortcutDefinition = {
  meta: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
};

export function keyboardEventToShortcutDefinition(
  e: KeyboardEvent,
  updateCase = true
): ShortcutDefinition {
  return {
    meta: e.metaKey,
    ctrl: e.ctrlKey,
    alt: e.altKey,
    shift: e.shiftKey,
    key: updateCase ? e.key.toUpperCase() : e.key,
  };
}

export function stringShortcutToShortcutDefinition(
  definitionStr: string
): ShortcutDefinition {
  const parts = definitionStr.split(/[ ,+]+/).map((s) => s.toUpperCase());
  const definition: ShortcutDefinition = {
    meta: false,
    ctrl: false,
    alt: false,
    shift: false,
    key: "",
  };
  for (const part of parts) {
    if (part == "META") {
      if (definition.meta) {
        throw new Error("Failed to parse shortcut: META already present");
      }
      definition.meta = true;
    } else if (part == "CTRL") {
      if (definition.ctrl) {
        throw new Error("Failed to parse shortcut: CTRL already present");
      }
      definition.ctrl = true;
    } else if (part == "ALT") {
      if (definition.alt) {
        throw new Error("Failed to parse shortcut: ALT already present");
      }
      definition.alt = true;
    } else if (part == "SHIFT") {
      if (definition.shift) {
        throw new Error("Failed to parse shortcut: SHIFT already present");
      }
      definition.shift = true;
    } else {
      if (definition.key != "") {
        throw new Error("Failed to parse shortcut: KEY already present");
      }
      definition.key = part;
    }
  }
  if (definition.key == "") {
    throw new Error("Failed to parse shortcut: KEY is missing");
  }
  return definition;
}

export function stringifyShortcutDefinition(
  shortcutDefinition: ShortcutDefinition
): string {
  return [
    shortcutDefinition.meta && "Meta",
    shortcutDefinition.ctrl && "Ctrl",
    shortcutDefinition.alt && "Alt",
    shortcutDefinition.shift && "Shift",
    shortcutDefinition.key,
  ]
    .filter((part) => part !== false)
    .join("+");
}

export const KEYS_TO_IGNORE = ["Meta", "Control", "Alt", "Shift"];

export function shortcutDefinitionEquals(
  a: ShortcutDefinition,
  b: ShortcutDefinition
): boolean {
  return (
    a.meta == b.meta &&
    a.ctrl == b.ctrl &&
    a.alt == b.alt &&
    a.shift == b.shift &&
    a.key == b.key
  );
}
