import { _log } from "./_base";

const config = {
  data: {},
  defData: {
    baseUrl: "http://127.0.0.1:41897/",
    authToken: "token_value_here",
    isInit: false,
  },
  load() {
    config.data = GM_getValue("config", this.defData);
    if (!config.data.isInit) {
      config.data.isInit = true;
      config.save();
    }
  },
  save() {
    GM_setValue("config", config.data);
  },
};

config.load();

export default config;
