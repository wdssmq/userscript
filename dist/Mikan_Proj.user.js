// ==UserScript==
// @name         「蜜柑计划」列表过滤（简繁/画质）
// @namespace    https://www.wdssmq.com/
// @version      1.0.1
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
  const _log = (...args) => console.log(`[${gm_name}]|`, ...args);
  function $na(e) {
    return document.querySelectorAll(e);
  }

  const _config = {
    data: {},
    dataDef: {
      pickRules: [
        {
          name: "Kirara Fantasia",
          regex: "Baha\\s",
        },
        {
          name: "漫猫字幕组&爱恋字幕组",
          regex: "1080p.+简中",
        },
        {
          name: "华盟字幕社&千夏字幕组",
          regex: "简体",
        },
        {
          name: "北宇治字幕组",
          regex: "简日内嵌",
        }
      ]
    },
    optToggle: (opt, ret = false) => {
    },
    menuCommand: () => {
    },
    load: () => {
      _config.data = GM_getValue("config", _config.dataDef);
    },
  };

  _config.load();

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
    return magnet.replace(regex, "");
  }

  // 通过正则表达式筛选文本
  function fnPickByRegex(text, regex = null) {
    // 如果没有正则表达式，直接返回 true
    if (!regex) {
      return true;
    }
    const oRegex = new RegExp(regex, "i");
    // _log("fnPickByRegex() oRegex\n", oRegex);
    return oRegex.test(text);
  }


  function _pick(name, $table) {
    const pickRules = _config.data.pickRules;
    // 数组中查找 name 对应的规则
    const curRule = pickRules.find((rule) => {
      return name == rule.name;
    });
    // _log("_pick() curRule: ", curRule);
    // _log("_pick() name: ", name);
    // _log("_pick() -----\n","-----");
    const $listTr = $table.querySelectorAll("tr");
    // _log($listTr.length);
    let $curTh = null;
    // let $lstTh = null;
    let magnetList = [];
    $listTr.forEach(($tr, i) => {
      if ($tr.innerText.includes("番组名")) {
        $curTh = $tr.querySelector("th");
        // $lstTh = $curTh;
        // _log("fnMain() $curTh\n", $curTh);
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
      if (fnPickByRegex(curText, curRule?.regex)) {
        magnetList.push(magnet);
      } else {
        $tr.remove();
      }
    });
  }

  // 遍历 nodeList
  function fnEachNodeList(nodeList, fn) {
    // 倒序遍历
    for (let i = nodeList.length - 1; i >= 0; i--) {
      fn(nodeList[i], i);
    }
  }

  // 按发布组获取信息
  function fnGetGroupInfo() {
    const arrGroup = [];
    // 获取全部 div.subgroup-text
    const $listGroup = $na(".subgroup-text");
    fnEachNodeList($listGroup, ($group, i) => {
      const $groupTitle = $group.querySelector("div.dropdown-toggle span") || $group.querySelector("a");
      const groupName = $groupTitle.innerText;
      const $groupTable = $group.nextElementSibling;
      arrGroup.push({
        name: groupName,
        $table: $groupTable,
      });
    });
    return arrGroup;
  }

  // main
  function fnMain() {
    const arrGroup = fnGetGroupInfo();
    // _log("arrGroup", arrGroup);
    arrGroup.forEach((group) => {
      _pick(group.name, group.$table);
      // _log("group", group);
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


  // fnElChange($n(".central-container"),
  //   () => {
  //     fnMain();
  //   }
  // )

  // import _feedly from "./_feedly";

  // _feedly.regAction(fnEachNodeList, fnFilter, _filter);

})();
