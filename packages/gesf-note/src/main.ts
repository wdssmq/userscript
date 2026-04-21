import {
  $n,
  fnElChange,
} from "./_base";
import _config from "./_config";
import {
  addCopyBtn,
  copyNoteYaml,
  createComment,
  getLastIssue,
} from "./_func";

import { BiliNote } from "./_getNoteByBili";

import "./style.css";

(() => {
  const $body = document.body;
  getLastIssue();
  let g: BiliNote;
  let loadedCnt = 0;
  let t: number;
  if (location.hostname === "www.bilibili.com") {
    g = new BiliNote();
    // 监听 body 变化
    fnElChange($body, (mr, mo) => {
      t = setTimeout(() => {
        if (g._loadCheck() === "loaded") {
          loadedCnt++;
          mo.disconnect();
          clearTimeout(t);
          console.log(loadedCnt);
        }
        if (g._loadCheck() === "loading") {
          const $btnWrap = $n(g.noteScheme.btnWrap);
          if ($btnWrap) {
            addCopyBtn($btnWrap, ["js-note-btn"], g.note, createComment);
            addCopyBtn($btnWrap, ["js-note-btn"], g.note, copyNoteYaml, "复制 YAML");
          }
          console.log("body changed", mr, mo);
        }
        else if (g._loadCheck() === "-1") {
          console.log("等待元素加载");
        }
      }, 500);
    });
  }
})();

