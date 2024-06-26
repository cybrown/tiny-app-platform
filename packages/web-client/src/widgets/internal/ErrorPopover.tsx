import { useCallback, useMemo } from "react";
import { EvaluationError } from "tal-eval";
import styles from "./ErrorPopover.module.css";
import Popover from "./Popover";
import { Button, Text, View } from "../../theme";

type ErrorPopoverProps = {
  lastError: any;
  target: HTMLDivElement | null;
  setLastError: (arg: unknown) => void;
};

export default function ErrorPopover({
  lastError,
  setLastError,
  target,
}: ErrorPopoverProps) {
  const clearLastErrorHandler = useCallback(() => {
    setLastError(null);
  }, [setLastError]);

  const locationMessage = useMemo(() => {
    if (
      lastError instanceof EvaluationError &&
      typeof lastError.node == "object" &&
      lastError.node &&
      lastError.node.location
    ) {
      return ` at location: (${lastError.node.location.start.line}, ${lastError.node.location.start.column})`;
    }
    return null;
  }, [lastError]);

  const dumpErrorHandler = useCallback(() => {
    console.error(
      lastError instanceof EvaluationError ? lastError.cause : lastError
    );
  }, [lastError]);

  return lastError ? (
    <Popover target={target}>
      <View className={styles.ErrorPopover}>
        <Text text={`Error : ${lastError.message} ${locationMessage}`} wrap />
        <View layout="flex-row" wrap>
          <Button text="Dump to browser console" onClick={dumpErrorHandler} />
          <Button text="Close" onClick={clearLastErrorHandler} />
        </View>
      </View>
    </Popover>
  ) : null;
}
