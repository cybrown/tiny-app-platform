import { Theme } from "../../theme";
import Button from "./Button";
import CheckBox from "./CheckBox";
import Switch from "./Switch";
import InputText from "./InputText";
import InputFile from "./InputFile";
import Select from "./Select";
import Text from "./Text";

const cssLink = document.createElement("link");
cssLink.setAttribute(
  "href",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
);
cssLink.setAttribute("rel", "stylesheet");
cssLink.setAttribute(
  "integrity",
  "sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
);
cssLink.setAttribute("crossorigin", "anonymous");

const twbsTheme: Theme = {
  name: "Bootstrap",
  Button,
  CheckBox,
  Switch,
  InputText,
  InputFile,
  Select,
  Text,
  onLoad() {
    document.body.appendChild(cssLink);
  },
  onUnload() {
    document.body.removeChild(cssLink);
  },
};

export default twbsTheme;
