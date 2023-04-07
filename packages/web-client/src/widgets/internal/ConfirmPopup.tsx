import { useCallback } from "react";
import usePressEscape from "./usePressEscape";
import styles from "./ConfirmPopup.module.css";
import StyledButton from "./StyledButton";

type ConfirmPopupProps = {
  show: boolean;
  setShow: (arg: boolean) => void;
  confirm?: boolean | string;
  onOk: () => void;
};

export default function ConfirmPopup({
  show,
  setShow,
  confirm,
  onOk,
}: ConfirmPopupProps) {
  const clickCancelHandler = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const clickOkHandler = useCallback(() => {
    setShow(false);
    onOk();
  }, [onOk, setShow]);

  const cancelPopup = useCallback(() => {
    setShow(false);
  }, [setShow]);

  usePressEscape(cancelPopup);

  return show ? (
    <div
      className={styles.confirmPopupBackgroundMask}
      onClick={clickCancelHandler}
    >
      <div className={styles.confirmPopupFrame}>
        <div className={styles.confirmPopupContent}>
          {typeof confirm === "boolean" ? "Are you sure ?" : confirm}
        </div>
        <div className={styles.buttons}>
          <StyledButton text="Cancel" onClick={clickCancelHandler} secondary />
          <StyledButton text="Ok" onClick={clickOkHandler} />
        </div>
      </div>
    </div>
  ) : null;
}
