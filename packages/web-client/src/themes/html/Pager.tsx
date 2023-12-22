import { useCallback } from "react";
import { Button, PagerProps, PagerOnChangeAction } from "../../theme";

export default function Pager({
  firstState = "HIDDEN",
  lastState = "HIDDEN",
  previousState = "HIDDEN",
  nextState = "HIDDEN",
  values,
  onChange,
  value,
}: PagerProps) {
  const currentPage = value ?? 1;

  const updateValue = useCallback(
    (value: PagerOnChangeAction) => {
      onChange && onChange(value);
    },
    [onChange]
  );

  return (
    <div>
      {firstState !== "HIDDEN" ? (
        <Button
          text="<<"
          secondary
          disabled={firstState === "DISABLED"}
          onClick={() => updateValue("FIRST")}
        />
      ) : null}
      {previousState !== "HIDDEN" ? (
        <Button
          text="<"
          secondary
          disabled={previousState === "DISABLED"}
          onClick={() => updateValue("PREVIOUS")}
        />
      ) : null}
      {(values ?? []).map((index) => (
        <Button
          key={index}
          text={index + ""}
          secondary={currentPage !== index}
          onClick={() => updateValue(index)}
        />
      ))}
      {nextState !== "HIDDEN" ? (
        <Button
          text=">"
          secondary
          disabled={nextState === "DISABLED"}
          onClick={() => updateValue("NEXT")}
        />
      ) : null}
      {lastState !== "HIDDEN" ? (
        <Button
          text=">>"
          secondary
          disabled={lastState === "DISABLED"}
          onClick={() => updateValue("LAST")}
        />
      ) : null}
    </div>
  );
}
