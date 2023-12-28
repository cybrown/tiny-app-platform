import { Theme } from "../../theme";
import Button from "./Button";
import CheckBox from "./CheckBox";
import Switch from "./Switch";
import InputText from "./InputText";
import Select from "./Select";
import InputFile from "./InputFile";
import Text from "./Text";
import htmlTheme from "../html";

const styleElement = document.createElement("style");
styleElement.textContent = "body {background-color: rgb(218, 218, 218);}";

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
  Pager: htmlTheme.Pager,
  Table: htmlTheme.Table,
  Modal: htmlTheme.Modal,
  Link: htmlTheme.Link,
  onLoad() {
    document.body.appendChild(styleElement);
  },
  onUnload() {
    document.body.removeChild(styleElement);
  },
};

export default toyBoxTheme;
