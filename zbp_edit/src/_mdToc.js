import { _log } from "./_base";

export default function () {
  const postTitle = $(".post-title");
  const $$referenceLink = $(".reference-link");
  // console.log("$$referenceLink = ", $$referenceLink);

  const _setAnchorLink = (el, $refLink) => {
    const anchorId = el.attr("id");
    const title = $refLink.attr("name");

    const $a = $("<a>")
      .attr("href", `#${anchorId}`)
      .attr("title", title)
      .html("#")
      .addClass("header-anchor")
      .css({
        borderBottom: "none",
        marginRight: "3px",
        marginLeft: "-11px",
        visibility: "hidden",
      })
      .click(() => {
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
