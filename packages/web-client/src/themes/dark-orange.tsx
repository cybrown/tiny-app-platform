import { CheckBoxProps, Theme } from "../theme";
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
}

.tap-button:hover {
  background-color: #ffa31a
}

.tap-button.is-secondary {
  background-color: #1f1f1f;
}

.tap-button.is-secondary:hover {
  background-color: #3f3f3f;
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
  colors: {
    background: "black",
  },
};

export default darkOrangeTheme;
