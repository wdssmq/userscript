import { curDate } from "./_base";
import { http } from "./_http";
import { lsObj } from "./_util";

const configKey = "zbp_edit.logReview";
const lsCacheKey = "zbp_edit.logReview.cache";
const defCacheData = {
  lstTime: 0,
  logs: {},
};
const ts = Number.parseInt(curDate.getTime() / 1000, 10);

const logReview = {
  url: "",
  logs: null,
  cacheLogs: lsObj.getItem(lsCacheKey, defCacheData),
  readConfig() {
    const config = Object.assign({}, GM_getValue(configKey, {}), lsObj.getItem(configKey, {}));

    this.url = typeof config.url === "string" ? config.url.trim() : "";
    return config;
  },
  setConfig(config = {}) {
    const nextConfig = {
      url: typeof config.url === "string" ? config.url.trim() : "",
    };
    GM_setValue(configKey, nextConfig);
    this.url = nextConfig.url;
    return nextConfig;
  },
  async load() {
    this.readConfig();
    if (!this.url) {
      console.warn("远程查询 URL 未配置，请在脚本设置中配置 URL");
      return null;
    }
    if (this.cacheLogs.lstTime > 0 && ts - this.cacheLogs.lstTime < 24 * 60 * 60) {
      this.logs = this.cacheLogs.logs;
      return this.logs;
    }
    const response = await http.get(this.url);
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`读取文章日志失败：${response.status} ${response.statusText}`);
    }
    this.logs = JSON.parse(response.responseText);

    this.cacheLogs = {
      lstTime: ts,
      logs: this.logs,
    };
    lsObj.setItem(lsCacheKey, this.cacheLogs);
    return this.logs;
  },
  markReviewedPosts() {
    // console.log(this.logs);

    const logIds = new Set(
      Object.values(this.logs || {})
        .map(log => String(log.id)),
    );
    document.querySelectorAll("p.post").forEach((post) => {
      if (!logIds.has(post.dataset.id)) {
        Object.assign(post.style, {
          borderLeft: "3px solid #ff0000",
          paddingLeft: "8px",
        });
        return;
      }
      post.classList.add("is-log-reviewed");
      Object.assign(post.style, {
        borderLeft: "3px solid #1ef10a",
        paddingLeft: "8px",
      });
    });
  },
};

window.logReviewSet = config => logReview.setConfig(config);

// window.logReviewSet({
//   url: "https://raw.githubusercontent.com/wdssmq/Markdown-To-Z-Blog/refs/heads/main/_posts_logs.json",
// });

// localStorage.setItem("zbp_edit.logReview", JSON.stringify({url: "https://raw.githubusercontent.com/wdssmq/Markdown-To-Z-Blog/refs/heads/main/_posts_logs.json"}));

export default logReview;
