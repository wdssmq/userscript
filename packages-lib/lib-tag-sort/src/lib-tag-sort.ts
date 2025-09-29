import "./style/style.sass";

import initSortableList from "./core";


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSortableList);
} else {
    initSortableList();
}
