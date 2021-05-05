// ==UserScript==
// @name         博客助手
// @namespace    https://www.wdssmq.com/
// @author       沉冰浮水
// @version      0.1
// @description  发布预定义文章到知乎、简书等豉
// @require      https://cdn.bootcdn.net/ajax/libs/js-yaml/4.0.0/js-yaml.min.js
// @match        https://editor.csdn.net/md*
// @match        https://www.jianshu.com/writer*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  "use strict";
  let $ = window.$ || unsafeWindow.$;

  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // 配置项
  const objInfo = GM_getValue("objInfo", null);
  if (!objInfo) {
    GM_setValue("objInfo", {
      origUrl: "https://www.wdssmq.com/post/-alias-.html",
      form: "沉冰浮水",
      jgchat: "我的咸鱼心",
      WeChatOA: "水水不想说"
    });
  }
  console.log(objInfo);

  const globalInfo = {};

  globalInfo.site = (() => {
    const list = ["jianshu", "csdn"];
    let rlt = "";
    list.forEach(element => {
      if (location.host.indexOf(element) > -1) {
        rlt = element;
      }
    });
    return rlt;
  })();

  console.log(globalInfo);

  function fnHashVal(string) {
    let hash = 0,
      i,
      chr;
    if (string.length === 0) return hash;
    for (i = 0; i < string.length; i++) {
      chr = string.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  const fnYAML2JSON = (oBody) => {
    const rlt = { err: 0, msg: "" };
    oBody = oBody.replace(/<!-- ---|--- -->/g, "---");
    // console.log(oBody);

    // 文本修改前仅执行一次
    const curHash = fnHashVal(oBody);
    if (!globalInfo.hashBody || curHash !== globalInfo.hashBody) {
      globalInfo.hashBody = curHash;
    } else {
      rlt.err = 2;
      rlt.msg = curHash;
      return rlt;
    }

    // 拆分为数组
    const arrBody = oBody.split("---\n");
    // console.log(arrBody);

    // YAML 文本
    const strYaml = arrBody[1];
    // console.log(strYaml);

    // 解析为 json,解析失败直接返回
    const doc = jsyaml.load(strYaml, "utf8");
    if (!doc || doc === "undefined") {
      rlt.err = 1;
      rlt.msg = "解析失败";
      rlt.doc = "";
      rlt.content = oBody;
      return rlt;
    }
    rlt.doc = doc;
    if (globalInfo.site === "jianshu") {
      oBody = oBody.replace(`---\n${arrBody[1]}---\n`, `\n`);
    } else {
      oBody = oBody.replace(`---\n${arrBody[1]}---\n`, `&lt;!-- ---\n${arrBody[1]}--- --&gt;\n`);
    }
    // arrBody[1] = "null";
    rlt.content = oBody;
    console.log(rlt);
    return rlt;
  };

  const fnAfterContent = (info, doc) => {
    let tpl = `\n\n原文链接：[-origUrl-](-origUrl-)`;
    tpl += `\n\n井盖口令：「-jgchat-」`;
    tpl += `\n\n微信公众号：「-WeChatOA-」`;
    for (const key in info) {
      if (Object.hasOwnProperty.call(info, key)) {
        const element = info[key];
        const reg = new RegExp(`-${key}-`, "g");
        tpl = tpl.replace(reg, element);
      }
    }
    for (const key in doc) {
      if (Object.hasOwnProperty.call(doc, key)) {
        const element = doc[key];
        const reg = new RegExp(`-${key}-`, "g");
        tpl = tpl.replace(reg, element);
      }
    }
    return tpl;
  };

  const fnMainCSDN = ($el) => {
    if ($el.innerHTML == "发布文章" && $el.nodeName.toLowerCase() == "h3" && globalInfo.origUrl) {
      $el.innerHTML = globalInfo.origUrl;
    }
    const $title = $(".article-bar__title");
    const $editor = $(".editor");
    if ($title.length == 0 || $editor.length == 0) {
      return;
    }
    if (globalInfo.curTitle) {
      console.log($title.val());
      $title.val(globalInfo.curTitle);
    }
    // console.log($editor.val());
    const { err, msg, doc, content } = fnYAML2JSON($editor.text());
    if (err == 0 && content.indexOf("原文链接：") === -1) {
      globalInfo.origUrl = objInfo.origUrl.replace(/-alias-/g, doc.alias);
      globalInfo.curTitle = doc.title;
      $editor.find("pre").html(content.trim() + fnAfterContent(objInfo, doc));
      $title.val(doc.title);
    } else if (err > 0) {
      console.log(err, msg);
    }
  }

  const fnMainJianshu = ($el) => {
    const $title = $n("._24i7u");
    const $editor = $n("#arthur-editor");
    if (!$title || !$editor) {
      return;
    }
    // if ($editor.dataset.verDone) return;
    // console.log($title.value);
    // console.log($editor.value);
    const { err, msg, doc, content } = fnYAML2JSON($editor.value);
    if (err == 0 && content.indexOf("原文链接：") === -1) {
      globalInfo.origUrl = objInfo.origUrl.replace(/-alias-/g, doc.alias);
      globalInfo.curTitle = doc.title;
      globalInfo.title = doc.title;
      $editor.value = content.trim() + fnAfterContent(objInfo, doc);
      $title.value = doc.title;
      $editor.dataset.verDone = 1;
    } else {
      console.log("解析未执行", msg);
    }
    if (globalInfo.curTitle) {
      console.log(globalInfo.curTitle);
      $title.value = globalInfo.curTitle;
    }
  }


  document.addEventListener(
    "mouseover",
    function (e) {
      const $el = e.target;
      switch (globalInfo.site) {
        case "jianshu":
          fnMainJianshu($el);
          break;
        case "csdn":
          fnMainCSDN($el);
          break;
        default:
          break;
      }
    },
    false
  );
})();
