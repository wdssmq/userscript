import "./_def.css";

// 将播放器占位框的位置同步为未开播布局的定位基准。
function syncChatPosition() {
  const layout = document.querySelector(".player-and-aside-area");
  const padding = layout?.querySelector(".fullscreen-container-paddingbox");
  if (!layout || !padding) {
    return false;
  }

  const layoutRect = layout.getBoundingClientRect();
  const paddingRect = padding.getBoundingClientRect();
  layout.style.setProperty("--chat-left", `${paddingRect.left - layoutRect.left}px`);
  layout.style.setProperty("--chat-top", `${paddingRect.top - layoutRect.top}px`);
  return true;
}

const resizeObserver = new ResizeObserver(syncChatPosition);

// 等待直播区挂载后初始化，并在容器尺寸变化时重新同步位置。
function observeChatPosition() {
  if (!syncChatPosition()) {
    return false;
  }

  resizeObserver.disconnect();
  resizeObserver.observe(document.querySelector(".player-and-aside-area"));
  resizeObserver.observe(document.querySelector(".fullscreen-container-paddingbox"));
  return true;
}

if (!observeChatPosition()) {
  const observer = new MutationObserver(() => {
    if (observeChatPosition()) {
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
