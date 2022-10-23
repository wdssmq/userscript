import { _log, $n, $na, fnElChange } from "./_base";
import _config from "./_config";

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
    const magnet = $curB.getAttribute("data-clipboard-text");
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

// fnElChange($n(".central-container"),
//   () => {
//     fnMain();
//   }
// )

import _feedly from "./_feedly";

_feedly.regAction(fnEachNodeList, fnFilter, _filter);
