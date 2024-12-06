import { useCallback, useMemo } from "react";
import { EvaluationError } from "tal-eval";
import styles from "./ErrorPopover.module.css";
import LowLevelErrorPopover from "./LowLevelErrorPopover";
import { Button, Text, View } from "../../theme";

type ErrorPopoverProps = {
  lastError: any;
  target: HTMLDivElement | null;
  setLastError: (arg: unknown) => void;
};

function extractError(error: Error): Error {
  return error instanceof EvaluationError ? error.cause : error;
}

export default function ErrorPopover({
  lastError,
  setLastError,
  target,
}: ErrorPopoverProps) {
  const clearLastErrorHandler = useCallback(() => {
    setLastError(null);
  }, [setLastError]);

  const lastErrorMessage = useMemo(
    () => lastError && extractError(lastError).message,
    [lastError]
  );

  const locationMessage = useMemo(() => {
    if (
      lastError instanceof EvaluationError &&
      typeof lastError.node == "object" &&
      lastError.node &&
      lastError.node.location
    ) {
      return ` at location: (${lastError.node.location.start.line}, ${lastError.node.location.start.column})`;
    }
    return "";
  }, [lastError]);

  const dumpErrorHandler = useCallback(() => {
    console.error(extractError(lastError));
  }, [lastError]);

  return lastError ? (
    <LowLevelErrorPopover target={target}>
      <View className={styles.ErrorPopover}>
        <Text text={`Error : ${lastErrorMessage} ${locationMessage}`} wrap />
        <View layout="flex-row" wrap>
          <Button text="Dump to browser console" onClick={dumpErrorHandler} />
          <Button text="Close" onClick={clearLastErrorHandler} />
        </View>
      </View>
    </LowLevelErrorPopover>
  ) : null;
}
