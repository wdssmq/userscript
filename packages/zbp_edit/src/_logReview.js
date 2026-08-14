import { http } from "./_http";

const configKey = "zbp_edit.logReview";

const logReview = {
  url: "",
  logs: null,
  readConfig() {
    const config = GM_getValue(configKey, {});
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
      return null;
    }
    const response = await http.get(this.url);
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`读取文章日志失败：${response.status} ${response.statusText}`);
    }
    this.logs = JSON.parse(response.responseText);

    return this.logs;
  },
  markReviewedPosts() {
    const logIds = new Set(
      Object.values(this.logs || {})
        .map(log => String(log.id)),
    );
    document.querySelectorAll("p.post").forEach((post) => {
      if (!logIds.has(post.dataset.id)) {
        return;
      }
      post.classList.add("is-log-reviewed");
      Object.assign(post.style, {
        // backgroundColor: "#fff8dc",
        borderLeft: "3px solid #d4a017",
        paddingLeft: "8px",
      });
    });
  },
};

window.logReviewSet = config => logReview.setConfig(config);

// window.logReviewSet({
//   url: "https://raw.githubusercontent.com/wdssmq/Markdown-To-Z-Blog/refs/heads/main/_posts_logs.json",
// });

export default logReview;
