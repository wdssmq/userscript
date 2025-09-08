import "./style.css";
import _config from "./_config";
import {
  $n,
  fnElChange,
} from "./_base";

import {
  addCopyBtn,
  copyNoteYaml,
  createComment,
  getLastIssue,
} from "./_func";



import { BiliNote } from "./_getNoteByBili";

(() => {
  const $body = document.body;
  getLastIssue();
  let g: BiliNote;
  let loadedCnt = 0;
  let t: number;
  if ("www.bilibili.com" === location.hostname) {
    g = new BiliNote();
    // 监听 body 变化
    fnElChange($body, (mr, mo) => {
      t = setTimeout(() => {
        if ("loaded" === g._loadCheck()) {
          loadedCnt++;
          mo.disconnect();
          clearTimeout(t);
          // console.log(loadedCnt);
        }
        if ("loading" === g._loadCheck()) {
          const $btnWrap = $n(g.noteScheme.btnWrap);
          if ($btnWrap) {
            addCopyBtn($btnWrap, ["js-note-btn"], g.note, createComment);
            addCopyBtn($btnWrap, ["js-note-btn"], g.note, copyNoteYaml, "复制 YAML");
          }
          console.log("body changed", mr, mo);
        } else if ("-1" === g._loadCheck()) {
          console.log("等待元素加载");
        }
      }, 500);
    });
  }
})();

