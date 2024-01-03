import { Theme } from "../../theme";
import Button from "./Button";
import CheckBox from "./CheckBox";
import Switch from "./Switch";
import InputText from "./InputText";
import Select from "./Select";
import InputFile from "./InputFile";
import Text from "./Text";
import htmlTheme from "../html";
import Pager from "./Pager";
import Modal from "./Modal";
import Radio from "./Radio";
import Tabs from "./Tabs";

const colors = {
  primary: {
    "100": "rgb(186, 231, 220)",
    "200": "rgb(97, 197, 172)",
    "300": "rgb(37 171 144)",
    "400": "rgb(32 165 133)",
    "500": "rgb(26, 145, 115)",
    "600": "rgb(39, 119, 99)",
    "700": "rgb(28, 95, 78)",
  },
  secondary: {
    "100": "rgb(234, 231, 228)",
    "200": "rgb(190, 173, 161)",
    "300": "rgb(177 147 129)",
    "400": "rgb(159, 129, 111)",
    "500": "rgb(133 111 94)",
    "600": "rgb(128, 105, 90)",
    "700": "rgb(103, 82, 63)",
  },
  gray: {
    "100": "rgb(250, 250, 250)",
    "200": "rgb(240, 240, 240)",
    "300": "rgb(233, 233, 233)",
    "400": "rgb(218, 218, 218)",
    "500": "rgb(192, 192, 192)",
    "600": "rgb(133, 133, 133)",
    "700": "rgb(73, 73, 73)",
  },
};

const styleElement = document.createElement("style");
styleElement.textContent = `
body {
  --toy-box-color-primary-100: ${colors.primary["100"]};
  --toy-box-color-primary-200: ${colors.primary["200"]};
  --toy-box-color-primary-300: ${colors.primary["300"]};
  --toy-box-color-primary-400: ${colors.primary["400"]};
  --toy-box-color-primary-500: ${colors.primary["500"]};
  --toy-box-color-primary-600: ${colors.primary["600"]};
  --toy-box-color-primary-700: ${colors.primary["700"]};
  --toy-box-color-secondary-100: ${colors.secondary["100"]};
  --toy-box-color-secondary-200: ${colors.secondary["200"]};
  --toy-box-color-secondary-300: ${colors.secondary["300"]};
  --toy-box-color-secondary-400: ${colors.secondary["400"]};
  --toy-box-color-secondary-500: ${colors.secondary["500"]};
  --toy-box-color-secondary-600: ${colors.secondary["600"]};
  --toy-box-color-secondary-700: ${colors.secondary["700"]};
  --toy-box-color-gray-100: ${colors.gray["100"]};
  --toy-box-color-gray-200: ${colors.gray["200"]};
  --toy-box-color-gray-300: ${colors.gray["300"]};
  --toy-box-color-gray-400: ${colors.gray["400"]};
  --toy-box-color-gray-500: ${colors.gray["500"]};
  --toy-box-color-gray-600: ${colors.gray["600"]};
  --toy-box-color-gray-700: ${colors.gray["700"]};

  background-color: var(--toy-box-color-gray-400);
}

.tap-link {
  color: var(--toy-box-color-primary-600);
  text-decoration-color: var(--toy-box-color-primary-600);
}

.tap-link.is-disabled {
  color: var(--toy-box-color-primary-200);
  text-decoration-color: var(--toy-box-color-primary-200);
}

.tap-link.is-secondary {
  color: var(--toy-box-color-secondary-700);
  text-decoration-color: var(--toy-box-color-secondary-700);
}

.tap-link.is-secondary.is-disabled {
  color: var(--toy-box-color-secondary-200);
  text-decoration-color: var(--toy-box-color-secondary-200);
}
`;

const toyBoxTheme: Theme = {
  id: "toy-box",
  name: "Toy Box",
  colors: {
    background: colors.gray["400"],
    primary: colors.primary,
  },
  Button,
  CheckBox,
  Switch,
  InputText,
  Select,
  InputFile,
  Text,
  Pager,
  Table: htmlTheme.Table,
  Modal,
  ModalBackdrop: htmlTheme.ModalBackdrop,
  Link: htmlTheme.Link,
  Radio,
  Tabs,
  onLoad() {
    document.body.appendChild(styleElement);
  },
  onUnload() {
    document.body.removeChild(styleElement);
  },
};

export default toyBoxTheme;
