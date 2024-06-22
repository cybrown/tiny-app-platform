import { LoaderProps, Theme } from "../../theme";
import Button from "./Button";
import CheckBox from "./CheckBox";
import Switch from "./Switch";
import InputText from "./InputText";
import InputFile from "./InputFile";
import Select from "./Select";
import Text from "./Text";
import Pager from "./Pager";
import Table from "./Table";
import Link from "./Link";
import Radio from "./Radio";
import { WindowFrame } from "./WindowFrame";
import View from "./View";
import Tabs from "./Tabs";

const htmlTheme: Theme = {
  id: "html",
  name: "HTML",
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
  Tabs,
  View,
  WindowFrame,
  Loader: (props: LoaderProps) => "Loading...",
  Container: (props) => props.children,
};

export default htmlTheme;
