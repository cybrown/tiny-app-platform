import { useCallback } from "react";
import usePressEscape from "./usePressEscape";
import { Button, Text, WindowFrame } from "../../theme";
import LowLevelOverlay from "./LowLevelOverlay";
import styles from "./ConfirmPopup.module.css";

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
    <LowLevelOverlay
      modal
      onClose={clickCancelHandler}
      position="center"
      size="m"
    >
      <WindowFrame
        onClose={clickCancelHandler}
        position="center"
        title="Confirmation"
        modal
      >
        <div className={styles.popupContent}>
          <Text
            text={
              (typeof confirm === "boolean" ? "Are you sure ?" : confirm) ??
              "Are you sure ?"
            }
          />
          <div className={styles.popupFooter}>
            <Button text="Cancel" onClick={clickCancelHandler} outline />
            <Button text="Ok" onClick={clickOkHandler} />
          </div>
        </div>
      </WindowFrame>
    </LowLevelOverlay>
  ) : null;
}
