import { useCallback, useRef, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopover from "./internal/ErrorPopover";
import {
  BaseInputProps,
  InputProps,
  InputPropsDocs,
} from "./internal/inputProps";
import { InputFile as ThemedInputFile } from "../theme";
import commonStyles from "./common.module.css";

type BaseInputFileProps = {
  placeholder?: string;
} & BaseInputProps<string>;

function BaseInputFile({
  placeholder,
  value,
  onChange,
  disabled,
}: BaseInputFileProps) {
  const [lastError, setLastError] = useState(null as any);

  const onChangeHandler = useCallback(
    async (newFile: string) => {
      if (!onChange) return;
      try {
        await onChange(newFile);
      } catch (err) {
        setLastError(err);
      }
    },
    [onChange]
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

type InputFileProps = {
  ctx: RuntimeContext;
  placeholder?: string;
} & InputProps<string>;

// TODO: find a solution out of Electron

export default function InputFile({
  ctx,
  onChange,
  ...commonProps
}: InputFileProps) {
  const onChangeHandler = useCallback(
    async (newFile: string) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [newFile]);
    },
    [ctx, onChange]
  );

  return <BaseInputFile onChange={onChangeHandler} {...commonProps} />;
}

export const InputFileDocumentation: WidgetDocumentation<InputFileProps> = {
  description:
    "Input a file from a path located on the server (only compatible with electron)",
  props: {
    placeholder: "Message to show when the widget is empty",
    ...InputPropsDocs,
  },
};
