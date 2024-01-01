import { Button, PagerButtonProps, PagerProps } from "../../theme";
import htmlTheme from "../html";

function PagerButton({ p, updateValue, ...props }: PagerButtonProps) {
  switch (props.pos) {
    case "FIRST":
      return p.firstState !== "HIDDEN" ? (
        <Button
          text="1"
          secondary={(p.value ?? 1) !== 1}
          outline={(p.value ?? 1) !== 1}
          onClick={() => updateValue("FIRST")}
          disabled={p.disabled}
        />
      ) : null;
    case "PREVIOUS":
      return (p.value ?? 1) > p.size + 2 ? <span>...</span> : null;
    case "PAGE":
      if (props.index === 1 || props.index === props.lastIndex) {
        return null;
      }
      return (
        <Button
          key={props.index}
          text={props.index + ""}
          secondary={(p.value ?? 1) !== props.index}
          outline={(p.value ?? 1) !== props.index}
          onClick={() => updateValue(props.index)}
          disabled={p.disabled}
        />
      );
    case "NEXT":
      return (p.value ?? 1) < props.lastIndex - (p.size + 1) ? (
        <span>...</span>
      ) : null;
    case "LAST":
      return p.lastState !== "HIDDEN" ? (
        <Button
          text={props.lastIndex + ""}
          secondary={(p.value ?? 1) !== props.lastIndex}
          outline={(p.value ?? 1) !== props.lastIndex}
          onClick={() => updateValue("LAST")}
          disabled={p.disabled}
        />
      ) : null;
  }
}

export default function Pager(props: PagerProps) {
  return <htmlTheme.Pager {...props} PagerButtonComponent={PagerButton} />;
}
