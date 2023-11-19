import { useCallback, useMemo } from "react";
import { EvaluationError } from "tal-eval";
import styles from "./ErrorPopin.module.css";

type ErrorPopinProps = {
  lastError: any;
  setLastError: (arg: unknown) => void;
};

export default function ErrorPopin({
  lastError,
  setLastError,
}: ErrorPopinProps) {
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
    console.error(lastError instanceof EvaluationError ? lastError.cause : lastError);
  }, [lastError]);

  return lastError ? (
    <div className={styles.errorPopinContainer}>
      <div className={styles.errorPopin}>
        <div className={styles.errorPopinContent}>
          Error : {lastError.message} {locationMessage}
          <button onClick={dumpErrorHandler}>dump</button>
          <button onClick={clearLastErrorHandler}>X</button>
        </div>
      </div>
    </div>
  ) : null;
}
