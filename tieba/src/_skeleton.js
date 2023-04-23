import {
  _warn,
  $n,
  $na,
  fnFindDom,
} from "./_base";

// 【小书签】一键骨架屏（Skeleton Screen） - 大家的板块 / 稻米鼠的频道🐹 - 小众软件官方论坛
// https://meta.appinn.net/t/topic/21419

const skeletonLoader = {
  selectList: [],
  textNodes: [],
  midColor(rgb) {
    return rgb.replace(/\d+/g, num => (num = +num) >= 128 ? 128 + (num - 128) / 2 : 128 - (128 - num) / 2);
  },
  getPic(width, height, text) {
    const canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");
    canvas.width = width, canvas.height = height, ctx.fillStyle = "#F3F3F3", ctx.fillRect(0, 0, width, height);
    const strArr = text.split(/\n/g),
      maxLength = Math.max.apply(null, strArr.map(s => s.length));
    if (maxLength) {
      const fontSize = Math.min(width / maxLength, height / strArr.length);
      ctx.font = "Bold " + fontSize + "px Consolas", ctx.textAlign = "center", ctx.fillStyle = "#999";
      const x = width / 2,
        y = (height - fontSize * strArr.length) / 2 + fontSize;
      strArr.forEach((str, i) => {
        ctx.fillText(str, x, y + i * fontSize);
      });
    }
    return canvas.toDataURL("image/png");
  },

  copyAtts(newEl, el) {
    const atts = ["id", "class", "style"];
    for (const att of atts) el.getAttribute(att) && newEl.setAttribute(att, el.getAttribute(att));
  },

  addSelector(selector) {
    this.selectList.push(selector);
  },

  applySkeleton() {
    this.selectList.forEach((selector) => {
      // 获取 selector 元素
      const el = $n(selector);
      // 获取 selector 元素下的所有子孙元素
      const elList = fnFindDom(el, "*");
      // 遍历所有子孙元素
      elList.forEach((el) => {
        for (let e of el.childNodes) e.nodeType == Node.TEXT_NODE && this.textNodes.push(e);
        const elStyle = window.getComputedStyle(el);
        if ("none" !== elStyle.backgroundImage && /^url\(.*\)$/.test(elStyle.backgroundImage)) {
          const img = document.createElement("img");
          img.src = elStyle.backgroundImage.replace(/^url\("(.*)"\)$/, "$1"), img.onload = () => {
            el.style.backgroundImage = "url(\"" + this.getPic(img.width, img.height, img.width > 30 && img.height > 30 ? "background\n" + img.width + "x" + img.height : "") + "\")";
          };
        }
        if (-1 !== ["IMG", "SVG", "CANVAS", "VIDEO"].indexOf(el.tagName)) {
          const width = (+elStyle.width.replace(/px$/, ""))
            .toFixed(),
            height = (+elStyle.height.replace(/px$/, ""))
              .toFixed();
          if ("IMG" === el.tagName) return el.src = this.getPic(el.naturalWidth, el.naturalHeight, width + "x" + height), void (el.srcset.length && (el.srcset = el.src));
          const newEl = document.createElement("img");
          return newEl.src = this.getPic(width, height, el.tagName + "\n" + width + "x" + height), this.copyAtts(newEl, el), void el.parentNode.replaceChild(newEl, el);
        }
        if ("INPUT" === el.tagName || "TEXTAREA" === el.tagName) return el.value = el.value.replace(/./g, "▮"), void (el.placeholder = el.placeholder.replace(/./g, "▮"));
      });
    });
    this.textNodesUnder();
  },

  // 遍历所有文本节点函数
  textNodesUnder(el) {
    this.textNodes.forEach((textEl) => {
      if (/^[\s\n]*$/g.test(textEl.textContent)) return;
      const elStyle = window.getComputedStyle(textEl.parentNode);
      if (!elStyle.lineHeight || !elStyle.fontSize) return;
      const newTextNode = document.createElement("span"),
        color = "rgba(0,0,0,0) !important",
        bgColor = elStyle.color,
        lineHeight = +elStyle.lineHeight.replace(/px$/, ""),
        fontSize = +elStyle.fontSize.replace(/px$/, ""),
        blankHeight = (100 * (lineHeight - .8 * fontSize) / 2 / lineHeight)
          .toFixed(),
        bgGradient = "linear-gradient(to bottom, transparent 20%, " + this.midColor(bgColor) + " 20% 80%, transparent 80%) !important";
      newTextNode.style = "color: " + color + "; background: " + bgGradient + ";", newTextNode.innerHTML = textEl.textContent, textEl.parentNode.replaceChild(newTextNode, textEl);
    });
  },

};

// 封装一个函数，用于创建元素
const fnCreateDom = (tagName, innerHTML, attr = {}) => {
  const $dom = document.createElement(tagName);
  for (const key in attr) {
    $dom.setAttribute(key, attr[key]);
  }
  $dom.innerHTML = innerHTML;
  return $dom;
};


const fnMain = () => {
  const $my = $n("#my_tieba_mod");
  if ($my) {
    const $h4 = fnFindDom($my, "h4");
    // 创建一个按钮
    const $btn = fnCreateDom("a", "一键骨架屏", {
      href: "javascript:;",
      class: "skeleton_btn pull_right",
    });
    // 将按钮插入到 h4 标签后面
    $h4.append($btn);
    // 给按钮绑定点击事件
    $n(".skeleton_btn").addEventListener("click", () => {
      skeletonLoader.selectList = [
        "#new_list",
      ];
      skeletonLoader.applySkeleton();
    });
  }
};

try {
  fnMain();
} catch (error) {
  _warn("一键骨架屏", error);
}


