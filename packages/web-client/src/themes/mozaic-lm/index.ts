import { Theme } from "../../theme";
import Button from "./Button";
import CheckBox from "./CheckBox";
import Switch from "./Switch";
import InputText from "./InputText";
import InputFile from "./InputFile";
import Select from "./Select";
import Pager from "./Pager";
import Table from "./Table";
import Link from "./Link";
import Radio from "./Radio";
import { WindowFrame } from "./WindowFrame";
import { Tabs } from "./Tabs";
import Modal from "./Modal";
import { Loader } from "./Loader";
import Text from "../html/Text";

const cssLink = document.createElement("link");
cssLink.setAttribute("href", "mozaic-lm.css");
cssLink.setAttribute("rel", "stylesheet");

const htmlTheme: Theme = {
  id: "mozaic-lm",
  name: "Mozaic LM",
  colors: {
    background: "white",
  },
  Button,
  CheckBox,
  Switch,
  InputText,
  InputFile,
  Select,
  Text,
  Pager,
  Table,
  Link,
  Radio,
  WindowFrame,
  Tabs,
  Modal,
  Loader,
  Container: (props) => props.children,
  onLoad() {
    document.head.appendChild(cssLink);
  },
  onUnload() {
    document.head.removeChild(cssLink);
  },
};

export default htmlTheme;
