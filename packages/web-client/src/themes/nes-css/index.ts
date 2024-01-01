import { Theme } from "../../theme";
import Button from "./Button";
import CheckBox from "./CheckBox";
import Switch from "./Switch";
import InputText from "./InputText";
import InputFile from "./InputFile";
import Select from "./Select";
import Table from "./Table";
import Modal from "./Modal";
import htmlTheme from "../html";
import Radio from "./Radio";

const styleElement = document.createElement("style");
styleElement.textContent = `
@import url(https://fonts.googleapis.com/css?family=Press+Start+2P);
.nes-input.is-disabled {
  background-color: lightgray;
  border-color: gray;
  opacity: 0.7;
}
`;

const cssLink = document.createElement("link");
cssLink.setAttribute(
  "href",
  "https://unpkg.com/nes.css@latest/css/nes.min.css"
);
cssLink.setAttribute("rel", "stylesheet");
cssLink.setAttribute("crossorigin", "anonymous");

const nesCssTheme: Theme = {
  ...htmlTheme,
  id: "nes-css",
  name: "NES.css",
  baseSize: 28,
  Button,
  CheckBox,
  Switch,
  InputText,
  InputFile,
  Select,
  Table,
  Modal,
  Radio,
  onLoad() {
    document.body.appendChild(cssLink);
    document.body.appendChild(styleElement);
  },
  onUnload() {
    document.body.removeChild(cssLink);
    document.body.removeChild(styleElement);
  },
};

export default nesCssTheme;
