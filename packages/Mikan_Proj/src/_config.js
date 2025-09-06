import { _log } from "./_base";

const _config = {
  data: {},
  dataDef: {
    pickRules: [
      {
        name: "Kirara Fantasia",
        regex: "Baha\\s",
      },
      {
        name: "漫猫字幕组&爱恋字幕组",
        regex: "1080p.+(简中|简日)",
      },
      {
        name: "华盟字幕社&千夏字幕组",
        regex: "简体",
      },
      {
        name: "北宇治字幕组",
        regex: "简日内嵌",
      },
      {
        name: "喵萌奶茶屋",
        regex: [
          "简体",
          "简日",
        ],
      },
      {
        name: "动漫国字幕组",
        regex: [
          "简体",
          "简日",
        ],
      },
    ],
    // 记录是否为第一次运行
    firstRun: true,
  },
  optToggle: (opt, ret = false) => {
  },
  menuCommand: () => {
  },
  save: () => {
    GM_setValue("config", _config.data);
  },
  load: () => {
    _config.data = GM_getValue("config", _config.dataDef);
    // 初始化配置
    if (_config.data.firstRun) {
      _log("首次运行，初始化配置");
      _config.data.firstRun = false;
      _config.save();
    }
    _config.menuCommand();
  },
};

_config.load();

export default _config;
