// 初始化配置
const config = GM_getValue("config", {});
if (JSON.stringify(config) === "{}") {
  GM_setValue("config", {
    authName: "沉冰浮水",
    appText: ["&lt;?mz", "-hash-();"],
    longName: false,
  });
}

export default config;
