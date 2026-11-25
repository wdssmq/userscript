import "./style/style.sass";

const timeEl = document.querySelector<HTMLTimeElement>("#time");
if (timeEl) {
  timeEl.textContent = new Date().toLocaleTimeString();
}

console.log("lib-{{name}}.js");
