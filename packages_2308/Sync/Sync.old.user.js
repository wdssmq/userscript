// ==UserScript==
// @name         「废弃」Resilio Sync 管理「QQ 群：189574683」
// @namespace    https://www.wdssmq.com/
// @version      0.3
// @author       沉冰浮水
// @description  快捷导出/分享 Sync 任务；
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @match        http://127.0.0.1:8888/gui/
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// jshint        esversion:6
// ==/UserScript==

(function () {
  "use strict";
  "esversion: 6";
  const $ = unsafeWindow.jQuery;
  const utWebUI = unsafeWindow.utWebUI;
  // console.log(utWebUI.TOKEN);
  let dataFolders = {};
  // let strRlt = "";
  // 定义函数
  function fnFmSize(int) {
    let rlt = [int / 1024 / 1024, "MB"];
    if (rlt[0] > 1024) {
      rlt[0] = rlt[0] / 1024;
      rlt[1] = "GB";
    }
    return rlt[0].toFixed(2) + rlt[1];
  }
  function fnJoin(n, s) {
    if (s.trim() === "") {
      return "";
    }
    return `${n}: ${s}\n`;
  }
  let cfg = GM_getValue("rs_cfg", "#");
  if (cfg == "#") {
    cfg = {
      fix: "#",
      type: "bak",
      act: 0,
    };
    GM_setValue("rs_cfg", cfg);
  }
  GM_registerMenuCommand("设置默认前缀", () => {
    let str;
    str = prompt(
      `设置前缀[当前：${cfg.fix}][只读分享将只包含以此开头的任务]`,
      cfg.fix,
    );
    cfg.fix = str;
    cfg.type = "bak";
    cfg.act = 0;
    GM_setValue("rs_cfg", cfg);
  });
  GM_registerMenuCommand("复制分享【只读】", () => {
    cfg.type = "share";
    cfg.act = 1;
    utWebUI.getSyncFolders().then(fnDo);
  });
  GM_registerMenuCommand("备份全部【读写】", () => {
    cfg.type = "bak";
    cfg.act = 1;
    utWebUI.getSyncFolders().then(fnDo);
  });
  function fnDo(t, a, n) {
    let arr = t.folders;
    // console.log(arr);
    // console.log(a);
    // console.log(n);
    let strRlt = "";
    arr.forEach((el) => {
      dataFolders[el.name] = el;
      if (cfg.type === "share" && el.name.indexOf(cfg.fix) !== 0) {
        return;
      }
      strRlt += fnJoin("任务名称", el.name);
      strRlt += fnJoin("任务大小", fnFmSize(el.size));
      if (cfg.type === "bak") {
        strRlt += fnJoin("任务路径", el.path);
      }
      if (!el.readonlysecret) {
        el.readonlysecret = el.secret;
        el.secret = "";
      }

      if (cfg.type === "bak") {
        strRlt += fnJoin("读写密钥", el.secret);
      }
      strRlt += fnJoin("只读密钥", el.readonlysecret);
      if (el.encryptedsecret) {
        strRlt += fnJoin("加密密钥", el.encryptedsecret);
      }
      strRlt += "--\n";
    });
    if (cfg.act) {
      console.log(strRlt);
      GM_setClipboard(strRlt);
      alert("已写入粘贴板，以下为预览：\r\n" + strRlt);
    }
  }
  utWebUI.getSyncFolders().then(fnDo);

  $(document).on("mouseover", "#copy-dialog", function (n) {
    if (!$(this).data("rsDone")) {
      let $input = $("<textarea type=\"text\" class=\"form-control\"></textarea>");
      let name = $(this)
        .find(".h5")
        .text()
        .trim();
      let key = $(this)
        .find("input")
        .val()
        .trim();
      let size = fnFmSize(dataFolders[name].size);
      $input.val(`${name}[${size}]：\r\n${key}`);
      $(this)
        .find(".modal-body")
        .append($input);
      $(this).data("rsDone", 1);
      return;
    }
  });
})();
