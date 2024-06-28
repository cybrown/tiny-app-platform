import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "normalize.css";
import "font-proxima-nova/style.css";
import "./reset.css";

const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = ReactDOM.createRoot(rootElement);

root.render(
  // TODO: Enable strict mode later
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
