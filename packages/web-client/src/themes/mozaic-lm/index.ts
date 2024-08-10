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
import { Loader } from "./Loader";
import Text from "../html/Text";
import htmlTheme from "../html";

const cssLink = document.createElement("link");
cssLink.setAttribute("href", "mozaic-lm.min.css");
cssLink.setAttribute("rel", "stylesheet");

const theme: Theme = {
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
  Loader,
  View: htmlTheme.View,
  Container: htmlTheme.Container,
  onLoad() {
    document.head.appendChild(cssLink);
  },
  onUnload() {
    document.head.removeChild(cssLink);
  },
};

export default theme;
