import { $n, $na, fnFindDom } from "./_base";
import { _log } from "./_base";
import config from "./_config";
import { formatJSON, formatYAML, addCopyBtn, btnToggle } from "./_func";

// alert("getNoteByZBP");

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
  // 确保 Tags 为数组
  if (typeof note.Tags === "string") {
    note.Tags = [note.Tags];
  }
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
