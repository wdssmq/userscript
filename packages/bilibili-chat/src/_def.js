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

const restoreClass = "bilibili-chat-temporary-restore";
const restoreButtonClass = "bilibili-chat-restore-button";

function syncRestoreButton() {
  const statusTags = document.querySelectorAll(".status-tag");
  if (![...statusTags].some(statusTag => statusTag.textContent.trim() === "未开播")) {
    document.documentElement.classList.remove(restoreClass);
  }

  statusTags.forEach((statusTag) => {
    const nextElement = statusTag.nextElementSibling;
    if (statusTag.textContent.trim() !== "未开播") {
      if (nextElement?.classList.contains(restoreButtonClass)) {
        nextElement.remove();
      }
      return;
    }

    if (nextElement?.classList.contains(restoreButtonClass)) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = restoreButtonClass;
    const restored = document.documentElement.classList.contains(restoreClass);
    button.textContent = restored ? "重新应用" : "临时恢复";
    button.setAttribute("aria-pressed", String(restored));
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const restored = document.documentElement.classList.toggle(restoreClass);
      button.textContent = restored ? "重新应用" : "临时恢复";
      button.setAttribute("aria-pressed", String(restored));
    });
    statusTag.insertAdjacentElement("afterend", button);
  });
}

syncRestoreButton();
new MutationObserver(syncRestoreButton).observe(document.documentElement, {
  childList: true,
  characterData: true,
  subtree: true,
});
