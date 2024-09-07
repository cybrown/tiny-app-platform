import { Tabs as ThemedTabs } from "../../theme";
import { useCallback, useRef, useState } from "react";
import ErrorPopover from "../internal/ErrorPopover";
import commonStyles from "./common.module.css";

export type TabOptions = {
  value: string;
  label: string;
};

type TabsProps = {
  value?: string;
  onChange?: (newValue: string) => unknown;
  options?: TabOptions[];
  after?: React.ReactElement;
};

export default function Tabs({ value, onChange, options, after }: TabsProps) {
  const [lastError, setLastError] = useState<unknown>(null);

  const handleOnChange = useCallback(
    async (newTab: string) => {
      if (!onChange) return;
      try {
        await onChange(newTab);
      } catch (err) {
        setLastError(err);
      }
    },
    [onChange]
  );

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
      <ThemedTabs
        value={value}
        onChange={handleOnChange}
        tabs={(options || []).map((child) => ({
          value: child.value,
          label: child.label,
        }))}
        after={after}
      />
      <ErrorPopover
        target={popoverTargetRef.current}
        lastError={lastError}
        setLastError={setLastError}
      />
    </div>
  );
}
