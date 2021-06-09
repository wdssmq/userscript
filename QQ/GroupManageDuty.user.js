// ==UserScript==
// @name        [QQ 群] - 今天谁值日
// @namespace   wdssmq
// @version     1.1
// @author      沉冰浮水
// @description 用于确定值日生/doge
// ----------------------------
// @link   https://afdian.net/@wdssmq
// @link   https://github.com/wdssmq/userscript
// @link   https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @link        https://greasyfork.org/zh-CN/scripts/26812
// ----------------------------
// @include     https://qun.qq.com/member.html*
// @grant       none
// ==/UserScript==
/* jshint esversion:6 */
(function () {
  'use strict';
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
  function fnTime(type = "s", span = 1) {
    const curDate = new Date();
    //
    const curTime = parseInt(curDate.valueOf() / 1000);
    if (type === "s") {
      return curTime / span;
    }
    //
    const curDay = parseInt(curTime / 86400);
    if (type === "d") {
      return curDay / span;
    }
    //
    const curWeek = parseInt(curDay / 7);
    if (type === "w") {
      return curWeek / span;
    }
  }

  const config_num = 2;

  const fnGetMaster = () => {
    //
    const elImg = $n("a.group-master-a+img");
    return elImg.getAttribute("id").replace(/\D/g, "");
  }

  const fnGetMngs = () => {
    const elMngs = $na(".icon-group-manage");
    const idMngs = [fnGetMaster()];
    for (let i = 0; i < elMngs.length; i++) {
      idMngs.push(elMngs[i].dataset.id);
    }
    idMngs.sort((a, b) => {
      return parseInt(a) - parseInt(b);
    });
    return idMngs;
  };

  const fnPickMngs = () => {
    const curWeek = fnTime("w");
    const arrMngs = fnGetMngs();
    console.log(arrMngs);
    const arrIndex = (() => {
      const numSerial = curWeek % parseInt(arrMngs.length / config_num);
      const arrRlt = [];
      for (let i = 0; i < config_num; i++) {
        arrRlt.push((numSerial * config_num) + i);
      }
      console.log(curWeek, parseInt(arrMngs.length / config_num), numSerial);
      return arrRlt;
    })();
    const rltMngs = [];
    arrIndex.forEach((i) => {
      if (arrMngs[i]) {
        rltMngs.push(arrMngs[i]);
      }
    });
    console.log(rltMngs);
    return rltMngs;
  }

  const fnSetStyle = (pickMngs) => {
    pickMngs.forEach((id) => {
      const elMb = $n(`.mb${id}`);
      const elSpan = elMb.querySelector(".td-user-nick span");
      elSpan.style.color = "red";
    })
  }

  function fnMain() {
    if ($n("a.group-master-a+img")) {
      fnSetStyle(fnPickMngs());
    }
  }
  fnMain();

  window.addEventListener('load', fnMain, false);
})();
