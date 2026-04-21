import initSortableList from "./core";

import "./style/style.sass";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSortableList);
}
else {
  initSortableList();
}
