import { Theme } from "../../theme";
import Button from "./Button";
import CheckBox from "./CheckBox";
import Switch from "./Switch";
import InputText from "./InputText";
import InputFile from "./InputFile";
import Select from "./Select";
import Table from "./Table";
import htmlTheme from "../html";
import Radio from "./Radio";
import Tabs from "./Tabs";
import WindowFrame from "./WindowFrame";
import Pager from "./Pager";

const styleElement = document.createElement("style");
styleElement.textContent = `
body {
  background-color: #c0c0c0;
}
`;

const cssLink = document.createElement("link");
cssLink.setAttribute("href", "https://unpkg.com/98.css");
cssLink.setAttribute("rel", "stylesheet");
cssLink.setAttribute("crossorigin", "anonymous");

const nesCssTheme: Theme = {
  ...htmlTheme,
  colors: {
    background: "#c0c0c0",
  },
  id: "98",
  name: "98",
  baseSize: 8,
  Button,
  CheckBox,
  Switch,
  InputText,
  InputFile,
  Select,
  Table,
  Radio,
  Tabs,
  WindowFrame,
  Pager,
  onLoad() {
    document.body.appendChild(styleElement);
    document.body.appendChild(cssLink);
  },
  onUnload() {
    document.body.removeChild(styleElement);
    document.body.removeChild(cssLink);
  },
};

export default nesCssTheme;
