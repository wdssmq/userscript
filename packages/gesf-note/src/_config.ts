import { GM_getValue, GM_setValue } from "$";

const _config = {
  default:
  {
    "DEBUG": false,
    "GIT_INFO": {
      "GIT_REPO": "wdssmq/GesF-Note",
      "GIT_TOKEN": "",
      "GIT_USER": "wdssmq",
      "PICK_LABEL": "pick",
    },
    "firstRun": true,
    "lastIssue": {
      number: -1,
      up: -1,
    }
  },
  data: {} as Record<string, any>,
  save: function() {
    GM_setValue("config", this.data);
  },
  load: function() {
    this.data = GM_getValue("config", this.default);
    // 初始化配置
    if (this.data.firstRun) {
      this.data.firstRun = false;
      this.save();
    }
  },
}


_config.load();

export default _config;
