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

const stieList = [
  {
    name: "百度贴吧",
    hostList: ["jump2.bdimg.com", "tieba.baidu.com"],
    url: fnGetUrlInDOM("p.link", "textContent"),
  },
  {
    name: "QQ 客户端",
    hostList: ["c.pc.qq.com"],
    url: fnGetUrlInDOM("#url", "textContent"),
  },
  {
    name: "QQ 邮箱",
    hostList: ["mail.qq.com"],
    url: fnGetUrlInDOM(".safety-url", "textContent"),
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

// 各种中转页跳过
stieList.forEach((site) => {
  const { name, hostList, url } = site;
  if (hostList.includes(curHost)) {
    if (url) {
      const newUrl = fnCheckUrl(url);
      window.location.href = newUrl;
    }
  }
});

