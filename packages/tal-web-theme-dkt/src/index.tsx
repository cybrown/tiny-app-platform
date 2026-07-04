import {
  Button,
  CheckBoxProps,
  PagerButtonProps,
  PagerProps,
  Theme,
} from "tal-web-theme-api";
import htmlTheme from "tal-web-theme-html";

// Decathlon-inspired theme ("dkt").
//
// Visual language taken from decathlon.fr: the deep "Decathlon blue" as the
// primary color, fully rounded (pill) buttons with a bold label, a clean white
// background, light-grey rounded inputs and a bright coral/orange accent.

const BLUE = "#3643ba";
const BLUE_HOVER = "#2a35a0";
const BLUE_DARK = "#1f2878";
const BLUE_TINT = "#edeefb";
const BLUE_TINT_HOVER = "#dfe1f7";
const ORANGE = "#ff5800";
const TEXT = "#101820";
const BORDER = "#cfd0d8";
const GREY_DISABLED = "#e9e9ee";
const GREY_DISABLED_TEXT = "#a0a0a8";

const style = document.createElement("style");
style.textContent = `
body {
  background-color: #ffffff;
  color: ${TEXT};
  font-family: "Roboto", "Helvetica Neue", Arial, sans-serif;
}

.tap-button {
  background-color: ${BLUE};
  color: #ffffff;
  border: 2px solid transparent;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;
  min-height: 40px;
  padding: 8px 24px;
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    color 0.15s ease;
}

.tap-button:hover:enabled {
  background-color: ${BLUE_HOVER};
}

.tap-button:active:enabled {
  background-color: ${BLUE_DARK};
}

.tap-button.is-secondary {
  background-color: ${BLUE_TINT};
  color: ${BLUE};
}

.tap-button.is-secondary:hover:enabled {
  background-color: ${BLUE_TINT_HOVER};
}

.tap-button.is-outline {
  background-color: #ffffff;
  border-color: ${BLUE};
  color: ${BLUE};
}

.tap-button.is-outline:hover:enabled {
  background-color: ${BLUE_TINT};
}

.tap-button:disabled {
  background-color: ${GREY_DISABLED};
  color: ${GREY_DISABLED_TEXT};
  border-color: transparent;
  cursor: not-allowed;
}

.tap-link {
  color: ${BLUE};
  text-decoration: none;
  font-weight: 500;
}

.tap-link:hover {
  color: ${ORANGE};
  text-decoration: underline;
}

.tap-link.is-disabled {
  color: ${GREY_DISABLED_TEXT};
}

.tap-input-text {
  color: ${TEXT};
  border: 1px solid ${BORDER};
  background: #ffffff;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.tap-input-text::placeholder {
  color: #8a8b95;
}

.tap-input-text:focus {
  outline: none;
  border-color: ${BLUE};
  box-shadow: 0 0 0 3px ${BLUE_TINT};
}

.tap-input-text:disabled {
  background: ${GREY_DISABLED};
  color: ${GREY_DISABLED_TEXT};
}

.tap-checkbox,
.tap-radio {
  accent-color: ${BLUE};
  width: 18px;
  height: 18px;
  vertical-align: middle;
  cursor: pointer;
}

.tap-checkbox + label,
.tap-radio + label {
  margin-left: 6px;
  vertical-align: middle;
  cursor: pointer;
}

progress {
  accent-color: ${BLUE};
}
`;

// The base HTML checkbox is a native <input>; render it as a Decathlon-styled
// pill toggle for the Switch widget so it reads differently from a checkbox.
function Switch(props: CheckBoxProps) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: props.disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        style={{
          position: "relative",
          display: "inline-block",
          width: 40,
          height: 22,
          borderRadius: 999,
          backgroundColor: props.value ? BLUE : BORDER,
          transition: "background-color 0.15s ease",
        }}
      >
        <input
          type="checkbox"
          disabled={props.disabled}
          checked={props.value ?? false}
          onChange={(e) => props.onChange && props.onChange(e.target.checked)}
          style={{
            position: "absolute",
            opacity: 0,
            width: "100%",
            height: "100%",
            margin: 0,
            cursor: "inherit",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 2,
            left: props.value ? 20 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
            transition: "left 0.15s ease",
          }}
        />
      </span>
      {props.label ? <span>{props.label}</span> : null}
    </label>
  );
}

function PagerButton({ p, updateValue, ...props }: PagerButtonProps) {
  switch (props.pos) {
    case "FIRST":
      return p.firstState !== "HIDDEN" ? (
        <Button
          text="«"
          secondary
          onClick={() => updateValue("FIRST")}
          disabled={p.disabled || p.firstState === "DISABLED"}
        />
      ) : null;
    case "PREVIOUS":
      return p.previousState !== "HIDDEN" ? (
        <Button
          text="‹"
          secondary
          onClick={() => updateValue("PREVIOUS")}
          disabled={p.disabled || p.previousState === "DISABLED"}
        />
      ) : null;
    case "PAGE":
      return (
        <Button
          key={props.index}
          text={props.index + ""}
          secondary={(p.value ?? 1) !== props.index}
          onClick={() => updateValue(props.index)}
          disabled={p.disabled}
        />
      );
    case "NEXT":
      return p.nextState !== "HIDDEN" ? (
        <Button
          text="›"
          secondary
          onClick={() => updateValue("NEXT")}
          disabled={p.disabled || p.nextState === "DISABLED"}
        />
      ) : null;
    case "LAST":
      return p.lastState !== "HIDDEN" ? (
        <Button
          text="»"
          secondary
          onClick={() => updateValue("LAST")}
          disabled={p.disabled || p.lastState === "DISABLED"}
        />
      ) : null;
  }
}

function Pager(props: PagerProps) {
  return <htmlTheme.Pager {...props} PagerButtonComponent={PagerButton} />;
}

const dktTheme: Theme = {
  ...htmlTheme,
  id: "dkt",
  name: "Decathlon",
  colors: {
    background: "#ffffff",
    primary: {
      "100": BLUE_TINT,
      "200": "#c9cdf3",
      "300": "#9aa1e6",
      "400": "#6b75d6",
      "500": BLUE,
      "600": BLUE_HOVER,
      "700": BLUE_DARK,
    },
  },
  Switch,
  Pager,
  onLoad() {
    document.body.appendChild(style);
  },
  onUnload() {
    document.body.removeChild(style);
  },
};

export default dktTheme;
