import { $n, $na, fnFindDom } from "./_base";
import { _log } from "./_base";
import config from "./_config";

// alert("getNoteByZBP");

function formatJSON(obj) {
  let strJSON = JSON.stringify(obj);
  Object.keys(obj).forEach((key) => {
    const reg = new RegExp(`("${key}":)`);
    strJSON = strJSON.replace(reg, "\n$1 ");
  });
  return strJSON;
}

function btnToggle($btn, text) {
  const tmp = $btn.text;
  $btn.text = text;
  setTimeout(() => {
    $btn.text = tmp;
  }, 3000);
}

const noteScheme = config.noteScheme;
const $items = $na(noteScheme.parent);

const notes = [];
Array.from($items).forEach(($item) => {
  // 移除不需要的元素
  const $remove = fnFindDom($item, noteScheme.remove);
  if ($remove) {
    $remove.remove();
  }
  const note = {};
  Object.keys(noteScheme.item).forEach((key) => {
    const selector = noteScheme.item[key];
    if (typeof selector === "string" && selector.indexOf("node:") === 0) {
      const $node = fnFindDom($item, selector.slice(5));
      // _log("selector", selector);
      // _log("$node", $node);
      if ($node) {
        if ("Url" === key) {
          note[key] = $node.href;
        } else {
          note[key] = $node.textContent.trim().replace(/\s+/g, " ");
        }
      }
    } else {
      note[key] = selector;
    }
  });
  // 添加复制按钮
  const $btnWrap = fnFindDom($item, noteScheme.btnWrap);
  // _log("$btnWrap", $btnWrap);
  if ($btnWrap) {
    const $btn = document.createElement("a");
    $btn.href = "javascript:;";
    $btn.classList.add("is-pulled-right");
    $btn.textContent = "复制";
    $btnWrap.appendChild($btn);
    $btn.addEventListener("click", () => {
      const text = formatJSON(note);
      _log("text", text);
      GM_setClipboard(text);
      btnToggle($btn, "复制成功");
    });
  }
  notes.push(note);
});

// _log("notes", notes);

// // 从 link:href 中获取主题名
// function _themeName() {
//   let themeName = "";
//   const $links = $na("link");
//   Array.from($links).forEach(($link) => {
//     const href = $link.getAttribute("href");
//     if (href.includes("zb_users/theme/")) {
//       const match = href.match(/theme\/(.*)\/css/);
//       if (match) {
//         themeName = match[1];
//         _log("themeName", themeName);
//       }
//     }
//   });
//   return themeName;
// }

// const themeName = _themeName();


