import { useCallback } from "react";
import usePressEscape from "./usePressEscape";
import { Button, Modal } from "../../theme";

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
    <Modal
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
}
