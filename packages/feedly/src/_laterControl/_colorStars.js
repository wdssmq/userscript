import { _log, $na, fnFindDom, fnFindDomUp } from "../_base";
import { gob, cur4Minutes } from "../_gob";
import { fnCheckControl } from "./_funcs";

gob.pickRule = {
  forMod: 13,
  minPick: 4,
  maxPick: 7,
  lstPick: 0,
  pickList: [],
};

GM_addStyle(`
  .pick,.pick:hover {
    background-color: #ddd !important;
  }
  .un-mark {
    background-color: #f6f7f8 !important;
  }
  .lock {
    color: transparent !important;
  }
`);

// 随机交换两个节点的位置
function fnRndNodeList(nodeList) {
  let lstNode = nodeList[0];
  const parent = nodeList[0].parentNode;
  // console.log("fnRndNodeList", parent);
  for (let i = 0; i < nodeList.length; i++) {
    const node = nodeList[i];
    if (Math.random() > 0.5) {
      parent.insertBefore(node, lstNode);
    } else {
      parent.insertBefore(lstNode, node);
    }
    lstNode = node;
  }
}

// 按规则给星标条目着色
function fnColorStars(offset = 0) {
  // begin fnColorStars
  const $stars = gob.$$Stars;
  const isLock = "lock" === fnCheckControl(gob.data.diffStars) ? true : false;
  // console.log("fnColorStars", fnCheckControl(gob.data.diffStars), isLock);
  const oConfig = gob.pickRule;
  const $$pick = $na(".pick");
  // ----------------------------
  let pickCount = $$pick.length;
  if (pickCount >= oConfig.minPick) {
    gob.LogOnce("fnColorStars_37", "已经选够了");
    return;
  }
  // ----------------------------
  // 遍历 dom 节点，随机交换位置
  fnRndNodeList($na(".EntryList__chunk > .titleOnly"));
  // ----------------------------
  const fnPick = ($item, i) => {
    if (i > 1 && i - oConfig.lstPick < oConfig.minPick / 2) {
      return;
    }
    oConfig.lstPick = i;
    $item.classList.add("pick");
    pickCount += 1;
  };
  // ----------------------------
  [].forEach.call($stars, function ($e, i) {
    // begin forEach
    const $ago = fnFindDom(fnFindDomUp($e, "div.TitleOnlyLayout"), ".ago");
    const href = $e.href;
    const hash = parseInt((href + $ago.innerHTML).replace(/\D/g, ""));
    // _log("fnColorStars", $ago, href, hash);
    const $item = fnFindDomUp($e, ".entry");
    if ($item.classList.contains("pick")) {
      oConfig.lstPick = i;
      return;
    }
    // ----------------------------
    const $saved = fnFindDom($item, ".EntryReadLaterButton--saved");
    if (!$saved) {
      $item.classList.add("un-mark");
    }
    // ----------------------------
    if (oConfig.pickList.includes(hash)) {
      // fnPick($item);
      return;
    }
    // ----------------------------
    const bolPick = (() => {
      let rlt = true;
      if (i >= 37) {
        rlt = false;
      }
      if (pickCount >= oConfig.maxPick) {
        rlt = false;
      }
      return rlt;
    })();
    // ----------------------------
    let intNum = parseInt(hash + cur4Minutes) + offset;
    if (intNum % oConfig.forMod == 0 && bolPick) {
      oConfig.pickList.push(hash);
      fnPick($item, i);
    } else {
      if (isLock || i >= 37) {
        $item.classList.add("lock");
        [].forEach.call(fnFindDom($item, "a, span, div>svg, .summary"), function ($ite) {
          $ite.classList.add("lock");
        });
      }
    }
    // end forEach
  });
  // ----------------------------
  if (pickCount <= oConfig.minPick) {
    if (offset < oConfig.forMod) {
      fnColorStars(offset + 1);
      return;
    } else {
      _log("fnColorStars", "未能选够");
      _log("fnColorStars", oConfig);
      oConfig.pickList = [];
      oConfig.lstPick = 0;
    }
  }
  // end fnColorStars
}

export {
  fnColorStars,
};

