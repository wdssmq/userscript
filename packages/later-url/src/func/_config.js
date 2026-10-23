import { _log } from "../_base";

const config = {
  data: {},
  defData: {
    // 远程服务（原有）
    baseUrl: "http://127.0.0.1:41897/",
    authToken: "token_value_here",
    // 远程服务开关
    enableCf: false,
    // 完整推送地址：{host}zb_system/cmd.php?act=ajax&src=odd_Later&token=xxx
    zbpUrl: "",
    // ZBP 插件（odd_Later）开关
    enableZbp: false,
    // 已登记 UP：{ [uid]: "name" }，须与插件后台列表一致
    zbpUsers: {},
    // 浮层面板是否折叠
    panelFold: true,
    isInit: false,
  },
  load() {
    const data = GM_getValue("config", this.defData) || {};
    // 老版本存储中缺少新增字段，合并默认值补齐
    config.data = Object.assign({}, this.defData, data);
    if (!config.data.zbpUsers || typeof config.data.zbpUsers !== "object") {
      config.data.zbpUsers = {};
    }
    if (!config.data.isInit) {
      config.data.isInit = true;
      config.save();
    }
  },
  save() {
    GM_setValue("config", config.data);
    _log("[log]config.save()", config.data);
  },
};

config.load();

export default config;
