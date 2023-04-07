import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "normalize.css";
import "font-proxima-nova/style.css";
import "./reset.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  // TODO: Enable strict mode later
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
