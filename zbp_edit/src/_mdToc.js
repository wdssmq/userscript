import { _log } from "./_base";

export default function () {
  const postTitle = $(".post-title");
  const $$referenceLink = $(".reference-link");
  // console.log("$$referenceLink = ", $$referenceLink);
  const _setAnchorLink = (el, $refLink) => {
    const anchorId = el.attr("id");
    const title = $refLink.attr("name");

    const $a = document.createElement("a");
    $a.setAttribute("href", `#${anchorId}`);
    // $a.setAttribute("href", `#${title}`);
    $a.setAttribute("title", title);
    $a.innerHTML = `#${title}`;
    $a.onclick = () => {
      document.title = `${title} - ${postTitle.text()}`;
    };

    const $span = el.find(".header-link");
    $span.replaceWith($a);

    // 移除 el 直接的文本节点，但是保留 el 的子节点
    el.contents().filter(function () {
      return this.nodeType === 3;
    }).remove();
  };

  // 遍历
  $$referenceLink.each(function (el) {
    const $anchor = $(this).parent();
    _setAnchorLink($anchor, $(this));
  });

}
