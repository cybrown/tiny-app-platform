import {
  Button,
  CheckBoxProps,
  PagerButtonProps,
  PagerProps,
  Theme,
} from "../theme";
import htmlTheme from "./html";

const style = document.createElement("style");
style.textContent = `
body {
  background-color: black;
  color: white;
  font-family: arial;
}

.tap-button {
  background-color: #ffa41a;
  color: black;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  height: 24px;
  box-sizing: border-box;
}

.tap-button:hover {
  background-color: #ffa31a
}

.tap-button.is-secondary {
  background-color: #1f1f1f;
}

.tap-button.is-secondary:hover:enabled {
  background-color: #3f3f3f;
}

.tap-button.is-outline {
  background-color: #1f1f1f;
  border: 2px solid;
  border-color: #ffa41a;
  color: white;
}

.tap-button.is-outline:hover:enabled {
  background-color: #3f3f3f;
}

.tap-button.is-outline:hover:enabled {
  border-color: #ffa31a;
}

.tap-button:disabled {
  background-color: #1f1f1f;
  color: #2f2f2f;
  border: none;
}

.tap-link {
  color: #ffa31a;
  text-decoration: none;
}

.tap-link:hover {
  text-decoration: underline;
}

.tap-input-text {
  color: #c6c6c6;
  border: 1px solid rgba(107,107,107,.24);
  background: #212121;
  padding: 12px 16px;
  border-radius: 4px;
}

.tap-input-text::placeholder {
  color: #6a6a6a;
}

.tap-input-text:focus {
  border-color: white;
}

.tap-checkbox {
  position: relative;
}

.tap-checkbox > input {
  display: none;
}

.tap-checkbox > input + div {
  display: inline-block;
  height: 20px;
  width: 20px;
  background-color: #2f2f2f;
  border-radius: 3px;
  content: 'a';
  border: 1px solid rgba(107,107,107,.24);
}

.tap-checkbox > input:checked + div {
  background-color: #ffa41a;
}

.tap-checkbox > input:checked + div::after {
  position: absolute;
  top: -1px;
  left: 8px;
  border-bottom: black 2px solid;
  border-right: black 2px solid;
  height: 10px;
  width: 4px;
  display: block;
  content: ' ';
  transform: rotate(45deg);
}
`;

function CheckBox(props: CheckBoxProps) {
  return (
    <label className="tap-checkbox">
      <input
        type="checkbox"
        disabled={props.disabled}
        checked={props.value ?? false}
        onChange={(e) => props.onChange && props.onChange(e.target.checked)}
      />
      <div />
    </label>
  );
}

function PagerButton({ p, updateValue, ...props }: PagerButtonProps) {
  switch (props.pos) {
    case "FIRST":
      return p.firstState !== "HIDDEN" ? (
        <Button
          text="First"
          secondary
          onClick={() => updateValue("FIRST")}
          disabled={p.disabled || p.firstState === "DISABLED"}
        />
      ) : null;
    case "PREVIOUS":
      return p.previousState !== "HIDDEN" ? (
        <Button
          text="<"
          secondary
          onClick={() => updateValue("FIRST")}
          disabled={p.disabled || p.previousState === "DISABLED"}
        />
      ) : null;
    case "PAGE":
      return (
        <Button
          key={props.index}
          text={props.index + ""}
          outline={(p.value ?? 1) !== props.index}
          onClick={() => updateValue(props.index)}
          disabled={p.disabled}
        />
      );
    case "NEXT":
      return p.nextState !== "HIDDEN" ? (
        <Button
          text=">"
          secondary
          onClick={() => updateValue("FIRST")}
          disabled={p.disabled || p.nextState === "DISABLED"}
        />
      ) : null;
    case "LAST":
      return p.lastState !== "HIDDEN" ? (
        <Button
          text="Last"
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

const darkOrangeTheme: Theme = {
  ...htmlTheme,
  id: "dark-orange",
  name: "Dark Orange",
  onLoad() {
    document.body.appendChild(style);
  },
  onUnload() {
    document.body.removeChild(style);
  },
  CheckBox,
  Switch: CheckBox,
  Pager,
  colors: {
    background: "black",
  },
};

export default darkOrangeTheme;
