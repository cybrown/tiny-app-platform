import { useCallback, useRef, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopover from "./internal/ErrorPopover";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { Closure } from "tal-eval";
import { InputFile as ThemedInputFile } from "../theme";
import commonStyles from "./common.module.css";

type InputFileProps = {
  ctx: RuntimeContext;
  placeholder: string;
} & InputProps<string>;

// TODO: find a solution out of Electron

export default function InputFile({
  ctx,
  placeholder,
  value,
  onChange,
  disabled,
}: InputFileProps) {
  const [lastError, setLastError] = useState(null as any);

  const onChangeHandler = useCallback(
    async (newFile: string) => {
      try {
        if (onChange) {
          await ctx.callFunctionAsync(onChange as Closure, [newFile]);
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, onChange]
  );

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
      <ThemedInputFile
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChangeHandler}
      />
      <ErrorPopover
        target={popoverTargetRef.current}
        lastError={lastError}
        setLastError={setLastError}
      />
    </div>
  );
}

export const InputFileDocumentation: WidgetDocumentation<InputFileProps> = {
  description:
    "Input a file from a path located on the server (only compatible with electron)",
  props: {
    placeholder: "Message to show when the widget is empty",
    ...InputPropsDocs,
  },
};
