import { $n, $na, fnFindDom } from "./_base";
import { _log } from "./_base";
import config from "./_config";

// alert("getNoteByZBP");

// 格式化 JSON
function formatJSON(obj) {
  let strJSON = JSON.stringify(obj);
  Object.keys(obj).forEach((key) => {
    const reg = new RegExp(`("${key}":)`);
    strJSON = strJSON.replace(reg, "\n$1 ");
  });
  // 花括号换行
  strJSON = strJSON.replace(/({)\n*/g, "$1\n");
  strJSON = strJSON.replace(/\n*(})/g, "\n$1");
  return strJSON;
}

// Tags 等特殊处理
function formatData(obj) {
  if (obj.Tags) {
    obj.Desc = obj.Desc.replace(obj.Tags.join(" "), "").trim();
    obj.Tags = obj.Tags.join(", ").replace(/#/g, "");
  }
  if (obj.Source) {
    // 为 yml 格式添加引号
    obj.Source = `"${obj.Source}"`;
  }
  // Desc 截取 59 个字符
  if (obj.Desc && obj.Desc.length > 59) {
    obj.Desc = obj.Desc.slice(0, 53) + "…";
  }
  return obj;
}

// 对象转 yaml
function obj2yaml(obj) {
  let strYaml = "";
  obj = formatData(obj);
  Object.keys(obj).forEach((key) => {
    strYaml += `${key}: ${obj[key]}\n`;
  });
  return strYaml;
}

function btnToggle($btn, text) {
  const tmp = $btn.text;
  $btn.text = text;
  setTimeout(() => {
    $btn.text = tmp;
  }, 3000);
}

// 添加复制按钮及事件的封装
function addCopyBtn($btnWrap, note, btnCon = "复制", copyType = "json") {
  const $btn = document.createElement("a");
  $btn.href = "javascript:;";
  $btn.classList.add("is-pulled-right");
  $btn.textContent = btnCon;
  $btn.title = btnCon;
  $btnWrap.appendChild($btn);
  // 由 copyType 决定复制的内容
  let copyText = "";
  if ("json" === copyType) {
    copyText = formatJSON(note);
  } else if ("yaml" === copyType) {
    copyText = obj2yaml(note);
  }
  // 复制按钮事件
  $btn.addEventListener("click", () => {
    _log("copyText", copyText);
    GM_setClipboard(copyText);
    btnToggle($btn, "复制成功");
  });
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
    if (!selector) {
      return;
    }
    if (typeof selector === "string" && selector.indexOf("node:") === 0) {
      const $node = fnFindDom($item, selector.slice(5));
      // _log("selector", selector);
      // _log("$node", $node);
      // 判断是否是 nodeList
      if ($node && $node.length) {
        _log("$node", $node);
        const arr = [];
        Array.from($node).forEach(($n) => {
          arr.push($n.textContent.trim());
        });
        note[key] = arr;
      } else if ($node) {
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
    addCopyBtn($btnWrap, note, "复制 JSON", "json");
    // insertAdjacentHTML 添加一个 span
    $btnWrap.insertAdjacentHTML("beforeend", "<span class=\"is-pulled-right\">&nbsp;&nbsp;</span>");
    addCopyBtn($btnWrap, note, "复制 YAML", "yaml");
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


