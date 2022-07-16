import { _log } from "./_base";

const _config = {
  data: {},
  dataOpt: {
    size: ["720", "1080"],
    subtitle: ["tc", "sc"]
  },
  optToggle: (opt, ret = false) => {
    const dataOpt = _config.dataOpt;
    const oldVal = _config.data[opt];
    const newVal = oldVal === dataOpt[opt][0] ? dataOpt[opt][1] : dataOpt[opt][0];
    if (ret) {
      return newVal;
    }
    _config.data[opt] = newVal;
    GM_setValue("config", _config.data);
  },
  menuCommand: () => {
    const _this = _config;
    for (const key in _this.data) {
      if (Object.hasOwnProperty.call(_this.data, key)) {
        const newValue = _this.optToggle(key, true);
        _log(`${key} ${newValue}`);
        GM_registerMenuCommand(`切换至 ${newValue}`,
          () => {
            _this.optToggle(key);
            // 刷新页面
            window.location.reload();
          }
        )
      }
    }
  },
  load: () => {
    _config.data = GM_getValue("config", {
      size: "1080",
      subtitle: "sc"
    });
    _config.menuCommand();
  },
}

_config.load();

export default _config;
