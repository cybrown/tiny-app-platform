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

const styleElement = document.createElement("style");
styleElement.textContent = `
body {
  background-color: rgb(218, 218, 218);
}

.tap-link {
  color: rgb(26, 145, 115);
  text-decoration-color: rgb(26, 145, 115);
}

.tap-link.is-disabled {
  color: rgb(97, 197, 172);
  text-decoration-color: rgb(97, 197, 172);
}

.tap-link.is-secondary {
  color: rgb(103, 82, 63);
  text-decoration-color: rgb(103, 82, 63);
}

.tap-link.is-secondary.is-disabled {
  color: rgb(190, 173, 161);
  text-decoration-color: rgb(190, 173, 161);
}
`;

const toyBoxTheme: Theme = {
  id: "toy-box",
  name: "Toy Box",
  colors: {
    background: "rgb(218, 218, 218)",
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
