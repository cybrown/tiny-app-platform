import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "normalize.css";
import "font-proxima-nova/style.css";
import "./reset.css";

if (!(window as any).electronAPI && "serviceWorker" in navigator) {
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
