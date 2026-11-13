import "./_skeleton.css";

if (new URLSearchParams(window.location.search).has("chat-skeleton")) {
  document.documentElement.classList.add("bilibili-chat-skeleton");
}
