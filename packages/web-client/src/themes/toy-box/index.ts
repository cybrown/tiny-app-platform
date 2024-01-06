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
import { baseSize, colors, sizes } from "./constants";
import Container from "./Container";

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
  --toy-box-size-050: ${sizes["050"] + "px"};
  --toy-box-size-100: ${sizes["100"] + "px"};
  --toy-box-size-200: ${sizes["200"] + "px"};
  --toy-box-size-300: ${sizes["300"] + "px"};
  --toy-box-size-300-gap: ${sizes["300"] + sizes["050"] + "px"};
  --toy-box-size-400: ${sizes["400"] + "px"};
  --toy-box-size-400-gap: ${sizes["400"] + sizes["050"] + "px"};
  --toy-box-size-500: ${sizes["500"] + "px"};
  --toy-box-size-500-gap: ${sizes["500"] + sizes["100"] + "px"};
  --toy-box-size-600: ${sizes["600"] + "px"};
  --toy-box-size-600-gap: ${sizes["600"] + sizes["100"] + "px"};
  --toy-box-size-700: ${sizes["700"] + "px"};
  --toy-box-size-700-gap: ${sizes["700"] + sizes["150"] + "px"};
  --toy-box-size-800: ${sizes["800"] + "px"};
  --toy-box-size-800-gap: ${sizes["800"] + sizes["150"] + "px"};
  --toy-box-size-900: ${sizes["900"] + "px"};
  --toy-box-size-900-gap: ${sizes["900"] + sizes["200"] + "px"};
  --toy-box-size-1000: ${sizes["1000"] + "px"};
  --toy-box-size-1000-gap: ${sizes["1000"] + sizes["200"] + "px"};
  --toy-box-size-1100: ${sizes["1100"] + "px"};
  --toy-box-size-1100-gap: ${sizes["1100"] + sizes["250"] + "px"};
  --toy-box-size-1200: ${sizes["1200"] + "px"};
  --toy-box-size-1200-gap: ${sizes["1200"] + sizes["250"] + "px"};
  --toy-box-size-1300: ${sizes["1300"] + "px"};
  --toy-box-size-1300-gap: ${sizes["1300"] + sizes["300"] + "px"};
  --toy-box-size-1400: ${sizes["1400"] + "px"};
  --toy-box-size-1400-gap: ${sizes["1400"] + sizes["300"] + "px"};
  --toy-box-size-1500: ${sizes["1500"] + "px"};
  --toy-box-size-1500-gap: ${sizes["1500"] + sizes["350"] + "px"};
  --toy-box-size-1600: ${sizes["1600"] + "px"};
  --toy-box-size-1600-gap: ${sizes["1600"] + sizes["350"] + "px"};

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
  baseSize: baseSize,
  colors: {
    background: colors.gray["400"],
    primary: colors.primary,
  },
  sizes: sizes,
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
  Container,
  onLoad() {
    document.body.appendChild(styleElement);
  },
  onUnload() {
    document.body.removeChild(styleElement);
  },
};

export default toyBoxTheme;
