// ==UserScript==
// @name         「水水」Resilio Sync 分享/备份助手「QQ 群：189574683」
// @namespace    https://www.wdssmq.com/
// @author       沉冰浮水
// @version      0.4
// @description  快捷导出/分享 Sync 任务；
// @selfLink     https://greasyfork.org/zh-CN/scripts/388497
// ----------------------------
// @link     https://afdian.net/@wdssmq
// @link     https://github.com/wdssmq/userscript
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @include        http://*:8888/gui/
// @include        http://*:5000/gui/
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// jshint        esversion:8
// ==/UserScript==

(function () {
  "use strict";

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const $ = unsafeWindow.jQuery || window.jQuery;

  // http://127.0.0.1:8888/gui/?token=ugiugui&action=getsyncfolders&discovery=1&t=1608188405284

  // 网络请求
  // arraybuffer | json | text |
  const get = (url, responseType = "json", retry = 3) =>
    new Promise((resolve, reject) => {
      try {
        GM_xmlhttpRequest({
          method: "GET",
          url,
          responseType,
          onerror: (e) => {
            if (retry === 0) reject(e);
            else {
              console.warn("Network error, retry.");
              setTimeout(() => {
                resolve(get(url, responseType, retry - 1));
              }, 1000);
            }
          },
          onload: ({ status, response }) => {
            if (status === 200) resolve(response);
            else if (retry === 0) reject(`${status} ${url}`);
            else {
              console.warn(status, url);
              setTimeout(() => {
                resolve(get(url, responseType, retry - 1));
              }, 500);
            }
          },
        });
      } catch (error) {
        reject(error);
      }
    });

  function fnAjaxReq(token = "", action = "") {
    const t = +new Date();
    let url =
        location.href + `?token=${token}&action=${action}&discovery=1&t=${t}`,
      responseType = "json";
    if (!token) {
      url = location.href + `token.html?t=${t}`;
      responseType = "text";
    }

    let rlt = "";

    const fnPromise = () => {
      return get(url, responseType)
        .then(async (data) => {
          console.log(data);
          rlt = data;
        })
        .catch((e) => {
          throw e;
        });
    };
    return async (
      callback = function (data) {
        return data;
      }
    ) => {
      await fnPromise();
      return callback(rlt);
    };
  }

  let token = "";
  let folders = "";

  const fnIntialize = async () => {
    const fnGetToken = fnAjaxReq(null, null);
    token = await fnGetToken(function (responseText) {
      return $(responseText).text();
    });

    const fnGetFolders = fnAjaxReq(token, "getsyncfolders");
    folders = await fnGetFolders(function (data) {
      return data.folders;
    });
  };

  fnIntialize();

  // const fnMain = (reso) =>
  //   new Promise((resolve, reject) => {
  //     try {
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });

  // GM_registerMenuCommand("测试", () => {
  //   console.log(token);
  //   console.log(folders);
  // });

  function fnJoin(n, s) {
    if (s.trim() === "") {
      return "";
    }
    return `${n}: ${s}\n`;
  }
  function fnFmSize(int) {
    let rlt = [int / 1024 / 1024, "MB"];
    if (rlt[0] > 1024) {
      rlt[0] = rlt[0] / 1024;
      rlt[1] = "GB";
    }
    return rlt[0].toFixed(2) + rlt[1];
  }
  const cfg = {
    fix: GM_getValue("rs_cfg", "#"),
  };
  GM_registerMenuCommand("设置默认前缀", () => {
    let str;
    str = prompt(
      `设置前缀[当前：${cfg.fix}][只读分享将只包含以此开头的任务]`,
      cfg.fix
    );
    GM_setValue("rs_cfg", str);
  });
  GM_registerMenuCommand("复制分享【只读】", () => {
    cfg.type = "share";
    cfg.act = 1;
    fnDo(folders);
  });
  GM_registerMenuCommand("备份全部【读写】", () => {
    cfg.type = "bak";
    cfg.act = 1;
    fnDo(folders);
  });
  // const dataFolders = {};
  function fnDo(arr) {
    console.log(arr);
    let strRlt = "";
    arr.forEach((el) => {
      // dataFolders[el.name] = el;
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

  // 文件名切分为 Tag；
  function fnSplitName2Tag(syncItem) {
    let name = syncItem.name,
      size = syncItem.size,
      key = syncItem.key;
    name = name.replace(/[#^+\[\]【】「」]+/g, " #").trim();
    name = `${name}[${size}]`;
    return fnJoin(name, `\r\n${key}`);
  }

  const arrItems = {};
  // 追加复制文本框
  $(document).on("mouseover", ".modal-dialog", function (n) {
    let curName = "null";
    // console.log($(this).text().indexOf("Ctrl+C"));

    if ($(this).text().indexOf("Ctrl+C") > -1) {
      curName = $(this).find(".display-name").text().trim();
    } else {
      return;
    }
    if (
      Object.hasOwnProperty.call(arrItems, curName) &&
      !$(this).data("rsDone")
    ) {
      const $input = $(
        '<textarea type="text" class="form-control"></textarea>'
      );
      $input.mouseover(function () {
        $(this).select();
      });
      arrItems[curName].key = $(this).find("input").val().trim();
      const curItem = arrItems[curName];
      // $input.val(`${curItem.name}[${curItem.size}]：\r\n${curItem.key}`);
      $input.val(fnSplitName2Tag(curItem));

      $(this).find(".modal-body").append($input);
      $(this).data("rsDone", 1);
      return;
    }
  });

  // 获取大小
  $(document).on("mouseover", ".options-button.shareButton", function (n) {
    const domEl = $(this).parentsUntil("tbody")[2];
    const $elTr = $(domEl);

    // console.log(domEl, $elTr);

    const item = {
      name: $elTr.find(".nameColumn .nameLabel").html().trim(),
      size: "未知大小",
    };

    // console.log(item);

    if ($elTr.find(".sizeColumn").length > 0) {
      item.size = $elTr.find(".sizeColumn").html().trim();
    }
    arrItems[item.name] = item;

    // console.log(arrItems);

    return;
  });
})();
