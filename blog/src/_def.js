/* global jsyaml */

import { curUrl, _log, $n } from "./_base";
import { gob } from "./_gob";

gob.yml2json = () => {
  let content = gob.content;
  content = content.replace(/<!-- ---\n(?<yml>title:[\s\S]*?)\n--- -->\n\n/, "---\n$<yml>\n---\n\n");
  // _log("[gob.yml2json()]\n", content);
  const match = content.match(/---\n(?<yml>title:[\s\S]*?)\n---\n\n(?<con>[\s\S]*)/);
  // _log("gob.yml2json()\n", match);
  if (!match) {
    return;
  }
  const { yml, con } = match.groups;
  gob.doc = jsyaml.load(yml, "utf8");
  // tags 处理
  if (!gob.doc.tags) {
    gob.doc.tags = [];
  } else if (!Array.isArray(gob.doc.tags)) {
    gob.doc.tags = [gob.doc.tags];
  }
  // 处理 content
  content = `<!-- ---\n${yml}\n--- -->\n\n${con}`;
  gob.content = content;
};

import fnGeekNote from "./_geeknote";

gob.site = (() => {
  const list = ["jianshu", "csdn", "cnblogs", "geeknote"];
  let rlt = "";
  list.forEach((name) => {
    if (curUrl.indexOf(name) > -1) {
      rlt = name;
    }
  });
  return rlt;
})();


switch (gob.site) {
  case "geeknote":
    fnGeekNote();
    break;
  default:
    break;
}


