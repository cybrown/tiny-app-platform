import { useCallback } from "react";
import usePressEscape from "./usePressEscape";
import { Button, Text, useTheme } from "../../theme";
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

  const theme = useTheme();

  if (theme.Modal) {
    return show ? (
      <theme.Modal
        header="Confirmation"
        body={typeof confirm === "boolean" ? "Are you sure ?" : confirm}
        footer={
          <>
            <Button text="Cancel" onClick={clickCancelHandler} secondary />
            <Button text="Ok" onClick={clickOkHandler} />
          </>
        }
        onClose={clickCancelHandler}
      />
    ) : null;
  } else {
    return show ? (
      <LowLevelOverlay
        modal
        onClose={clickCancelHandler}
        position="center"
        size="m"
      >
        <div className={styles.popupContent}>
          <Text text="Confirmation" size={1.4} weight="light" />
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
      </LowLevelOverlay>
    ) : null;
  }
}
