import { fnBindDeleteReturn, fnCheckDeleteReturn } from "./delPost/deleteReturn.js";
import { fnBindListArrowPage, fnBindThreadListRefresh, fnHideOthersThreadsInTrash, fnMarkThreadList } from "./delPost/list.js";
import { fnRecordThreadView } from "./delPost/thread.js";

(() => {
  fnCheckDeleteReturn();
  fnBindDeleteReturn();
  fnBindThreadListRefresh();
  fnRecordThreadView();
  fnMarkThreadList();
  // 回收站列表页隐藏他人帖子
  fnHideOthersThreadsInTrash();
  // 列表页左右方向键换页
  fnBindListArrowPage();
})();
