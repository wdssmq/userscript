// note 条目格式定义
const noteScheme = {
  item: {
    "Title": "node:.post-title a",
    "Type": 1,
    "Url": "node:.post-title a",
    "Text": "node:.post-intro",
    "Source": "[url=https://www.wdssmq.com]沉冰浮水的博客[/url]",
  },
  parent: ".post",
  remove: "span.a-tag",
  btnWrap: ".post-meta.meta-2",
  ver: "1.0.4",
};

// 初始化配置
const config = GM_getValue("config", {});
if (JSON.stringify(config) === "{}" || config.noteScheme.ver !== noteScheme.ver) {
  GM_setValue("config", {
    noteScheme,
  });
}

export default config;
