import { $, _log } from "./_base";

export default function () {
  const postTitle = $(".post-title");
  const $$referenceLink = $(".reference-link");
  // console.log("$$referenceLink = ", $$referenceLink);

  const _setAnchorLink = (el, $refLink) => {
    const anchorId = el.attr("id");
    const title = $refLink.attr("name");
    // 锚点链接目标
    const arrHash = [
      `#${anchorId}`,
      `#${title}`,
    ];

    const $a = $("<a>")
      .attr("href", "#")
      .attr("title", title)
      .html("#")
      .addClass("header-anchor")
      .data("hash", arrHash[0])
      .css({
        borderBottom: "none",
        marginRight: "3px",
        marginLeft: "-11px",
        visibility: "hidden",
      })
      .click(() => {
        // 根据 data-hash 属性，切换锚点链接目标
        const hash = $a.data("hash");
        const newHash = arrHash.filter(item => item !== hash)[0];
        $a.attr("href", newHash);
        $a.data("hash", newHash);
        document.title = `${title} - ${postTitle.text()}`;
      });
    const $span = el.find(".header-link");

    $span.replaceWith($a);

    // // 移除 el 直接的文本节点，但是保留 el 的子节点
    // el.contents().filter(function () {
    //   return this.nodeType === 3;
    // }).remove();
  };

  // 遍历
  $$referenceLink.each(function (el) {
    const $anchor = $(this).parent();
    const _this = $(this);
    _setAnchorLink($anchor, _this);
    // 绑定鼠标 hover 事件
    $anchor.hover(function () {
      $anchor.find(".header-anchor").css({
        visibility: "visible",
        marginLeft: "-5px",
      });
    }, function () {
      $anchor.find(".header-anchor").css({
        visibility: "hidden",
        marginLeft: "-11px",
      });
    });
  });

}
