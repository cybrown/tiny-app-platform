import { Theme } from "../../theme";
import twbsTheme from "../twbs";

const twbsDarkTheme: Theme = {
  ...twbsTheme,
  id: "twbs-dark",
  name: "Bootstrap Dark",
  colors: {
    background: "#212529",
  },
  onLoad() {
    twbsTheme.onLoad && twbsTheme.onLoad();
    document.body.setAttribute("data-bs-theme", "dark");
  },
  onUnload() {
    document.body.removeAttribute("data-bs-theme");
    twbsTheme.onUnload && twbsTheme.onUnload();
  },
};

export default twbsDarkTheme;
