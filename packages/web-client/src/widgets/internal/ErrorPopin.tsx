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
      typeof lastError.expression == "object" &&
      lastError.expression &&
      lastError.expression.location
    ) {
      return ` at location: (${lastError.expression.location.start.line}, ${lastError.expression.location.start.column})`;
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
