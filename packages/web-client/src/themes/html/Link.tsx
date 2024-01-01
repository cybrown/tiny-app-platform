import { useCallback } from "react";
import { LinkProps, Text } from "../../theme";
import styles from "./Link.module.css";

export default function Link({
  url,
  text,
  onClick,
  disabled,
  secondary,
  ...rest
}: LinkProps) {
  if (!text && !url) {
    throw new Error("text or url is mandatory for Link widget");
  }

  const onClickHandler = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (onClick || disabled) {
        e.stopPropagation();
        e.preventDefault();
        onClick && onClick();
      }
    },
    [onClick, disabled]
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`tap-link ${
        disabled ? styles.disabled + " is-disabled" : ""
      } ${secondary ? "is-secondary" : ""}`}
      onClick={onClickHandler}
    >
      <Text {...rest} text={text ?? url ?? ""} />
    </a>
  );
}
