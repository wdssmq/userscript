import { mountApp } from "./AppRender";
import "./style/style.sass";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountApp);
}
else {
  mountApp();
}
