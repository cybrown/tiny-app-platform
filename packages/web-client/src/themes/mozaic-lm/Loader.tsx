import { LoaderProps } from "../../theme";

const sizeMap = {
  sm: "s",
  md: "m",
  lg: "l",
};

export function Loader(props: LoaderProps) {
  const size = sizeMap[props.size ?? "md"];

  if (props.value == null) {
    return (
      <div>
        <div className={`mc-loader mc-loader--${size}`}>
          <span className="mc-loader__spinner">
            <svg
              className="mc-loader__icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
            >
              <circle className="mc-loader__path" cx="50%" cy="50%" r="9" />
            </svg>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mc-progressbar ${
        props.size === "lg"
          ? "mc-progressbar--percent"
          : props.size === "sm"
          ? "mc-progressbar--s"
          : ""
      }`}
    >
      <div
        className="mc-progressbar__indicator"
        role="progressbar"
        aria-valuenow={props.value}
        aria-valuemax={props.max}
        aria-label={props.label}
        style={{ width: `${(props.value / (props.max ?? 100)) * 100}%` }}
      ></div>
      <div className="mc-progressbar__percentage">
        {props.value} / {props.max}
      </div>
    </div>
  );
}
