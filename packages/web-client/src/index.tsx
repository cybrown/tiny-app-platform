import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "normalize.css";
import "font-proxima-nova/style.css";
import "./reset.css";

const isElectron = !!(window as any).electronAPI;
const hasServiceWorker = "serviceWorker" in navigator;
const isDevelopment = process.env.NODE_ENV === "development";

if (!isElectron && hasServiceWorker && !isDevelopment) {
  const registerServiceWorker = async () => {
    try {
      await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  registerServiceWorker();
}

const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = ReactDOM.createRoot(rootElement);

root.render(
  // TODO: Enable strict mode later
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
