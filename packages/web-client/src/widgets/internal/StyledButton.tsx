import styles from "./StyledButton.module.css";

type StyledButtonProps = {
  text: string;
  disabled?: boolean;
  onClick: () => void;
  secondary?: boolean;
};

export default function StyledButton({
  onClick,
  disabled,
  text,
  secondary,
}: StyledButtonProps) {
  return (
    <button
      className={[styles.Button, secondary ? styles.secondary : ""].join(" ")}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
