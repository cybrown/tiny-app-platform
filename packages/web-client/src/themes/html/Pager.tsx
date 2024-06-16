import { useCallback } from "react";
import {
  Button,
  PagerProps,
  PagerOnChangeAction,
  PagerButtonProps,
} from "../../theme";

function DefaultPagerButton({ p, updateValue, ...props }: PagerButtonProps) {
  switch (props.pos) {
    case "FIRST":
      return p.firstState !== "HIDDEN" ? (
        <Button
          text="<<"
          secondary
          disabled={p.firstState === "DISABLED" || p.disabled}
          onClick={() => updateValue("FIRST")}
        />
      ) : null;
    case "PREVIOUS":
      return p.previousState !== "HIDDEN" ? (
        <Button
          text="<"
          secondary
          disabled={p.previousState === "DISABLED" || p.disabled}
          onClick={() => updateValue("PREVIOUS")}
        />
      ) : null;
    case "PAGE":
      return (
        <Button
          key={props.index}
          text={props.index + ""}
          secondary={(p.value ?? 1) !== props.index}
          disabled={p.disabled}
          onClick={() => updateValue(props.index)}
        />
      );
    case "NEXT":
      return p.nextState !== "HIDDEN" ? (
        <Button
          text=">"
          secondary
          disabled={p.nextState === "DISABLED" || p.disabled}
          onClick={() => updateValue("NEXT")}
        />
      ) : null;
    case "LAST":
      return p.lastState !== "HIDDEN" ? (
        <Button
          text=">>"
          secondary
          disabled={p.lastState === "DISABLED" || p.disabled}
          onClick={() => updateValue("LAST")}
        />
      ) : null;
  }
}

export default function Pager(props: PagerProps) {
  const { values, onChange, lastIndex } = props;

  const PagerButton = props.PagerButtonComponent ?? DefaultPagerButton;

  const updateValue = useCallback(
    (value: PagerOnChangeAction) => {
      onChange && onChange(value);
    },
    [onChange]
  );

  return (
    <div>
      <PagerButton
        p={props}
        updateValue={updateValue}
        pos="FIRST"
        lastIndex={lastIndex}
      />
      <PagerButton
        p={props}
        updateValue={updateValue}
        pos="PREVIOUS"
        lastIndex={lastIndex}
      />
      {(values ?? []).map((index) => (
        <PagerButton
          key={index}
          p={props}
          updateValue={updateValue}
          pos="PAGE"
          index={index}
          lastIndex={lastIndex}
        />
      ))}
      <PagerButton
        p={props}
        updateValue={updateValue}
        pos="NEXT"
        lastIndex={lastIndex}
      />
      <PagerButton
        p={props}
        updateValue={updateValue}
        pos="LAST"
        lastIndex={lastIndex}
      />
    </div>
  );
}
