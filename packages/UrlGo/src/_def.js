import { _log, curHost, curUrl, $n } from "./_base";

// 从页面中获取链接
function fnGetUrlInDOM(selector, attrName) {
  const $dom = $n(selector);
  if ($dom) {
    return $dom[attrName];
  }
  return null;
}

// 获取链接中的参数
function fnGetParamInUrl(name, url) {
  const match = RegExp("[?&]" + name + "=(?<value>[^&]*)").exec(url);
  return match && decodeURIComponent(match.groups.value);
}

// 监测网址是否带有协议
function fnCheckUrl(url) {
  if (url.indexOf("http") === 0) {
    return url;
  }
  return "http://" + url;
}

const siteList = [
  {
    name: "百度贴吧",
    hostList: ["jump2.bdimg.com", "tieba.baidu.com"],
    url: fnGetUrlInDOM("p.link", "textContent"),
    tipNode: [$n("p.content"), "after"]
  },
  {
    name: "QQ 客户端",
    hostList: ["c.pc.qq.com"],
    url: fnGetUrlInDOM("#url", "textContent"),
    tipNode: [$n("p.ui-title"), "after"]
  },
  {
    name: "QQ 邮箱",
    hostList: ["mail.qq.com"],
    url: fnGetUrlInDOM(".safety-url", "textContent"),
    tipNode: [$n(".safety-url"), "after"]
  },
  {
    name: "简书",
    hostList: ["www.jianshu.com"],
    url: fnGetParamInUrl("url", curUrl),
  }, {
    name: "知乎",
    hostList: ["link.zhihu.com"],
    url: fnGetUrlInDOM("p.link", "textContent"),
  },
];

// 显示提示
function fnShowTip(tipNode, text, url) {
  console.log(text);
  const $node = tipNode[0];
  const $insertTips = `<p class="go-tips" style="color: red;text-align: center;">
  <span>${text}</span>
  <a href="${url}" title="点击跳转">点击跳转</a>
  </p>`;
  const $tips = $n(".go-tips");
  // 判断是否已经有提示
  if ($tips) {
    $tips.querySelector("span").textContent = text;
    return;
  }
  switch (tipNode[1]) {
    default:
    case "after":
      $node.insertAdjacentHTML("afterend", $insertTips);
      break;
  }
}

// 各种中转页跳过
siteList.forEach((site) => {
  const { name, hostList, url } = site;
  if (hostList.includes(curHost)) {
    if (!url) {
      return;
    }
    const newUrl = fnCheckUrl(url);
    if (site.tipNode) {
      let cntDown = 5;
      setInterval(() => {
        if (cntDown <= 0) {
          window.location.href = newUrl;
          return;
        }
        fnShowTip(site.tipNode, `即将跳转到，剩余 ${cntDown} 秒`, newUrl);
        cntDown--;
      }, 1000);
    } else {
      setTimeout(() => {
        window.location.href = newUrl;
      }, 10000);
    }
  }
});

