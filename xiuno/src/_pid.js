// _pid.js | 楼层地址
import { $, curHref } from "./_base.js";
(() => {
  $("li.media.post").each(function () {
    const $me = $(this);
    const pid = $me.data("pid");
    const $date = $me.find("span.date");
    $date.after(
      `<a class="text-grey ml-2" title="获取当前楼层链接" href="${curHref}#${pid}">「楼层地址」</a>`,
    );
  });
})();
