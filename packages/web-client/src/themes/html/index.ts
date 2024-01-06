import { Theme } from "../../theme";
import Button from "./Button";
import CheckBox from "./CheckBox";
import Switch from "./Switch";
import InputText from "./InputText";
import InputFile from "./InputFile";
import Select from "./Select";
import Text from "./Text";
import Pager from "./Pager";
import Table from "./Table";
import Modal from "./Modal";
import Link from "./Link";
import ModalBackdrop from "./ModalBackdrop";
import Radio from "./Radio";

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
  Modal,
  Link,
  ModalBackdrop,
  Radio,
  Container: (props) => props.children,
};

export default htmlTheme;
