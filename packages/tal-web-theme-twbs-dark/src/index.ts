import { Theme } from "tal-web-theme-api";
import twbsTheme from "tal-web-theme-twbs";

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
