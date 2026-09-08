import { $n, _log, fnElChange } from "./_base";

(() => {
  const $body = $n("body");
  fnElChange($body, (_mutationRecord, mutationObserver) => {
    const $input = $n(".ivu-input-number-input");
    const $amt = $n(".ivu-alert-message p b");
    if ($input === null)
      return;
    $input.value = $amt.textContent;
    mutationObserver.disconnect();
  });
})();
