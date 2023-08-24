import { _curUrl, $na } from "./_base";

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

export default _feedly;

