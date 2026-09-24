// _pid.js | 楼层地址
import { $, curHref } from "./_base.js";

(() => {
  GM_addStyle(`
    .floor-link-copied {
      display: inline-block;
      animation: post_shake 3s ease infinite;
    }
`);
  $("li.media.post").each(function() {
    const $me = $(this);
    const pid = $me.data("pid");
    // 自带的楼层信息
    const $floor = $me.find("span.floor-parent");
    const textFloor = $floor.text();
    const numFloor = Number.parseInt(textFloor, 10);
    // $floor 替换为带楼层链接的内容
    $floor.html(`<a class="floor-link-${numFloor}" href="${curHref}#${pid}">${numFloor} 楼</a>`);
    // 增加一个楼层地址链接
    const $date = $me.find("span.haya-post-like");
    $date.after(
      `<a class="ml-2 floor-link-${numFloor}" title="获取当前楼层链接" href="${curHref}#${pid}">「楼层地址」</a>`,
    );
    // 给楼层地址链接添加点击事件，复制链接到剪贴板
    $me.find(`.floor-link-${numFloor}`).on("click", function(e) {
      e.preventDefault();
      const title = document.title;
      const link = $(this).attr("href");
      const fullText = `${numFloor} 楼 - ${title}\n${link}`;
      const tmpText = $(this).text();
      navigator.clipboard.writeText(fullText).then(() => {
        // alert("楼层链接已复制到剪贴板");
        $me.addClass("current");
        $(this).text("楼层链接已复制").addClass("floor-link-copied");
        setTimeout(() => {
          $me.removeClass("current");
          $(this).text(tmpText).removeClass("floor-link-copied");
        }, 3000);
      });
    });
  });
})();
