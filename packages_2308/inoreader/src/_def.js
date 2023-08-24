import { _log, $n, fnElChange } from "./_base";
import { gob } from "./_gob";

fnElChange($n("#reader_pane"), function () {
  gob.GetStarItems();
  // _log("def\n", gob.$$Stars);
});
