// ==UserScript==
// @name         「蜜柑计划」列表过滤（简繁/画质）
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  过滤蜜柑计划列表，按照简繁/画质过滤
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.net/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://mikanani.me/Home/Bangumi/*
// @match        https://feedly.com/i/subscription/feed*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "Mikan_Proj";

  // ---------------------------------------------------
  const _curUrl = () => { return window.location.href };
  // ---------------------------------------------------
  const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);
  function $na(e) {
    return document.querySelectorAll(e);
  }

  const _config = {
    data: {},
    dataOpt: {
      size: ["720", "1080"],
      subtitle: ["tc", "sc"],
    },
    optToggle: (opt, ret = false) => {
      const dataOpt = _config.dataOpt;
      const oldVal = _config.data[opt];
      const newVal = oldVal === dataOpt[opt][0] ? dataOpt[opt][1] : dataOpt[opt][0];
      if (ret) {
        return newVal;
      }
      _config.data[opt] = newVal;
      GM_setValue("config", _config.data);
    },
    menuCommand: () => {
      const _this = _config;
      for (const key in _this.data) {
        if (Object.hasOwnProperty.call(_this.data, key)) {
          const newValue = _this.optToggle(key, true);
          _log(`${key} ${newValue}`);
          GM_registerMenuCommand(`切换至 ${newValue}`,
            () => {
              _this.optToggle(key);
              // 刷新页面
              window.location.reload();
            },
          );
        }
      }
    },
    load: () => {
      _config.data = GM_getValue("config", {
        size: "1080",
        subtitle: "sc",
      });
      _config.menuCommand();
    },
  };

  _config.load();

  const _feedly = {
    data: {
      curUrl: null,
      // $itemList: [],
      fnAction: () => { },
    },
    init: () => {
      const curUrl = _curUrl();
      _feedly.data.curUrl = curUrl;
      _feedly.menuCommand(curUrl);
    },
    menuCommand: (curUrl = "") => {
      if (curUrl.includes("feedly.com")) {
        GM_registerMenuCommand("在 feedly 应用过滤",
          () => {
            _feedly.data.fnAction();
          },
        );
      }
    },
    regAction: (fnEachNodeList, fnFilter, _filter) => {
      _feedly.data.fnAction = () => {
        const $list = _feedly.getList();
        fnEachNodeList($list, ($item) => {
          const curText = $item.querySelector("a.entry__title").innerText.toLowerCase();
          if (fnFilter(curText, _filter)) {
            $item.remove();
          }
        });
      };
    },
    getList: () => {
      const $list = $na(".list-entries article");
      // _feedly.data.$itemList = $list;
      return $list;
    },
  };

  _feedly.init();

  // 选项为 sc 时，则排除匹配 tc 字段的节点文本
  const _filter_map = {
    "tc": ["big5", "cht", "繁日双语", "繁体内嵌", "繁体"],
    "sc": ["gb", "chs", "简日双语", "简体内嵌", "简体"],
    "720": ["720"],
    "1080": ["1080"],
  };

  const fnGenFilter = (opt) => {
    const filter = {};
    const string = JSON.stringify(opt);
    if (string.includes("720")) {
      filter["size"] = _filter_map["1080"];
    }
    if (string.includes("1080")) {
      filter["size"] = _filter_map["720"];
    }
    if (string.includes("tc")) {
      filter["subtitle"] = _filter_map["sc"];
    }
    if (string.includes("sc")) {
      filter["subtitle"] = _filter_map["tc"];
    }
    return filter;
  };

  const _filter = fnGenFilter(_config.data);
  _log(_filter);

  // 过滤含有指定字符的节点
  function fnFilter(text, filter) {
    let bolBlock = false;
    for (const key in filter) {
      if (Object.hasOwnProperty.call(filter, key)) {
        const element = filter[key];
        for (let i = 0; i < element.length; i++) {
          // _log(element[i], text, text.includes(element[i]));
          if (text.includes(element[i])) {
            bolBlock = true;
            break;
          }
        }
      }
    }
    return bolBlock;
  }

  // 遍历 nodeList
  function fnEachNodeList(nodeList, fn) {
    // 倒序遍历
    for (let i = nodeList.length - 1; i >= 0; i--) {
      fn(nodeList[i], i);
    }
  }

  // 添加批量复制磁力链接功能
  function fnAddBatchCopy($th, magnetList) {
    const $btn = document.createElement("button");
    $btn.innerText = "批量复制";
    $btn.addEventListener("click", () => {
      const magnetStr = magnetList.join("\n");
      GM_setClipboard(magnetStr);
      $btn.innerText = "复制成功";
      _log(`已复制 ${magnetStr}`);
    }, false);
    // appendChild 2 elements
    $th.appendChild($btn);
  }

  // 过滤磁力链接中的 tr
  function fnRemoveTracker(magnet) {
    const regex = /&tr=.+?(?=&|$)/g;
    return magnet.replace(regex, '');
  }


  // main
  function fnMain() {
    const $listTr = $na("table tr");
    _log($listTr.length);
    let $curTh = null;
    // let $lstTh = null;
    let magnetList = [];
    fnEachNodeList($listTr, ($tr, i) => {
      if ($tr.innerText.includes("番组名")) {
        $curTh = $tr.querySelector("th");
        // $lstTh = $curTh;
        _log($curTh);
        fnAddBatchCopy($curTh, magnetList);
        magnetList = [];
        // return;
      }
      const $curA = $tr.querySelector(".magnet-link-wrap");
      const $curB = $tr.querySelector(".js-magnet");
      if (!$curA) {
        return;
      }
      const curText = $curA.innerText.toLowerCase();
      // data-clipboard-text
      let magnet = $curB.getAttribute("data-clipboard-text");
      magnet = fnRemoveTracker(magnet);
      if (fnFilter(curText, _filter)) {
        _log(`${curText} ${magnet}`);
        $tr.remove();
      } else {
        magnetList.push(magnet);
      }
      // _log(`${i} ${curText}`);
    });
  }

  // 自动展开更多
  function fnAutoExpand() {
    const $listBtn = $na(".js-expand-episode");
    fnEachNodeList($listBtn, ($btn, i) => {
      $btn.click();
    });
    setTimeout(() => {
      fnMain();
    }, 3000);
  }
  fnAutoExpand();

  _feedly.regAction(fnEachNodeList, fnFilter, _filter);

})();
