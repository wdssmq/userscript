import { fnBindDeleteReturn, fnCheckDeleteReturn } from "./delPost/deleteReturn.js";
import { fnBindThreadListRefresh, fnMarkThreadList } from "./delPost/list.js";
import { fnRecordThreadView } from "./delPost/thread.js";

(() => {
  fnCheckDeleteReturn();
  fnBindDeleteReturn();
  fnBindThreadListRefresh();
  fnRecordThreadView();
  fnMarkThreadList();
})();
