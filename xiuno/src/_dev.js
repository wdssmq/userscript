// _devView.js | 开发者申请查看
import { $, curHref, lsObj, _log, _hash, fnGetRequest, fnFormatTime } from './_base.js';
(() => {
  // CDN 地址替换
  function fnGetCDNUrl(url) {
    const arrMap = [
      ["https://github.com/", "https://cdn.jsdelivr.net/gh/"],
      ["/blob/", "@"]
    ]
    let cdnUrl = url;
    arrMap.forEach(line => {
      cdnUrl = cdnUrl.replace(line[0], line[1]);
    });
    return cdnUrl;
  }

  // time 2 hour
  function fnTime2Hour(time = null) {
    if (!time) {
      time = new Date();
    }
    // 时间戳
    const timeStamp = time.getTime();
    return Math.floor(timeStamp / 1000 / 60 / 60);
  }

  // 默认配置项
  const defConfig = {
    useCDN: false,
    ymlList: [
      "2022H2",
      "2022H1",
      "2021H2",
    ],
    isNew: true,
  }

  // 配置项读取和首次保存
  const curConfig = GM_getValue("_devConfig", defConfig);
  if (curConfig.isNew) {
    curConfig.isNew = false;
    GM_setValue("_devConfig", curConfig);
  }

  // 初始化 ymlList
  function fnInitYML() {
    const useCDN = curConfig.useCDN;
    let ymlList = curConfig.ymlList;
    ymlList = ymlList.map(yml => {
      let url = `https://raw.githubusercontent.com/wdssmq/ReviewLog/main/data/${yml}.yml`;
      if (useCDN) {
        url = fnGetCDNUrl(url);
      }
      return url;
    });
    return ymlList;
  }

  // 模板函数
  function fnStrtr(
    str,
    obj,
    callback = (str) => {
      return str;
    }
  ) {
    let rltStr = str;
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const reg = new RegExp(`#${key}#`, "g");
        rltStr = rltStr.replace(reg, value);
      }
    }
    return callback(rltStr);
  }

  // 数据读取封装
  const gobDev = {
    data: {
      lstLogs: [],
      lstCheck: null
    },
    init: function () {
      this.data = lsObj.getItem("gobDev", this.data);
      _log("gobDev init", this.data);
      this.ymlList = fnInitYML();
    },
    checkUrl: function (url) {
      let rlt = null;
      this.data.lstLogs.forEach(log => {
        if (log.url.indexOf(url) > -1) {
          _log("checkUrl", url, log.url);
          rlt = log;
        }
      });
      return rlt;
    },
    clear: function () {
      this.data.lstLogs = [];
      lsObj.setItem("gobDev", this.data);
    },
    save: function () {
      lsObj.setItem("gobDev", this.data);
    },
    update: function () {
      const curHour = fnTime2Hour();
      if (this.data.lstCheck === curHour && this.data.lstLogs.length > 0) {
        return;
      }
      this.data.lstLogs = [];
      this.data.lstCheck = curHour;
      this.ajax();
    },
    ajax: function () {
      const self = this;
      this.ymlList.forEach(yml => {
        fnGetRequest(yml, (responseText, url) => {
          const ymlObj = jsyaml.load(responseText, "utf8");
          const curLogs = self.data.lstLogs;
          self.data.lstLogs = curLogs.concat(ymlObj);
          self.save();
        });
      });
    }
  }

  gobDev.init();
  gobDev.update();

  // 缓存清理封装
  const _clearAct = (doClear = false) => {
    const curHash = _hash();
    if (curHash === "clearDone") {
      window.location.href = `${curHref}`;
      // window.location.reload();
    } else if (doClear || curHash === "clear") {
      gobDev.clear();
      window.location.href = `${curHref}#clearDone`;
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
  // 默认调用一次用于清后的跳转
  _clearAct();

  // 缓存清理按钮
  const $btnClear = $(`<span class="small"><a href="javascript:;" title="清理缓存" class="badge badge-warning">清理缓存</a></span>`);
  $btnClear.on("click", function () {
    if (confirm("清理缓存？")) {
      _clearAct(1);
    }
  });

  // 根据 log 数据设置状态徽章
  const _setBadge = (log, $item = null, act = "after") => {
    // console.log("log", log);
    let badgeClass, $badge;
    const status = log?.status || "未记录";
    switch (status) {
      case "通过":
        badgeClass = 'badge-success';
        break;
      case "进行中":
        badgeClass = 'badge-info';
        break;
      case "拒绝":
        badgeClass = 'badge-danger';
        break;
      default:
        badgeClass = 'badge-warning';
        break;
    }
    $badge = $(`<span class="badge ${badgeClass}">${status}</span>`);

    if (act === "after") {
      $item.after($badge);
      // $item.after($btnClear);
    } else {
      $item.append($badge);
      $item.append(" ");
      $item.append($btnClear);
    }
  }

  // 标题列表
  const $titleList = $("li.media .subject a");
  $titleList.each(function () {
    const $this = $(this);
    const href = $this.attr("href");
    const title = $this.text();
    if (title.indexOf("申请开发者") === -1) {
      return;
    }
    const log = gobDev.checkUrl(href);
    _setBadge(log, $this);
  });

  // 博文内页
  const $h4 = $(".media-body h4");
  let title = $h4.text().trim();
  if (title.indexOf("申请开发者") === -1) {
    return;
  }
  const log = gobDev.checkUrl(curHref);
  _setBadge(log, $h4, "append");

  _log('curLog', log);

  // 初始化
  $("div.message").each(function () {
    if ($(this).attr("isfirst") == 1) {
      $(this).prepend(
        `<blockquote class="blockquote"><pre class="pre-yml"></pre></blockquote>`
      );
      $(".pre-yml").text(`标题格式错误`);
    }
  });

  // 标题内容解析
  title = title.replace(/\[|【/g, "「").replace(/\]|】/g, "」");
  const objMatch = title.match(/「([^」]+)」「(theme|plugin)」/);
  _log("objMatch", objMatch);
  if (!objMatch) {
    return;
  }

  // YML 模板
  const tplYML = `
- id: #id#
  type: #type#
  status: #status#
  rating: #rating#
  url: #url#
  date:
    - #date#
  reviewers:
    - #reviewers#
`;
  // 构建 YML
  const styYML = fnStrtr(
    tplYML,
    {
      id: objMatch[1],
      type: objMatch[2],
      status: log ? log.status : "进行中",
      rating: log ? log.rating : "",
      url: curHref,
      date: log ? log.date[0] : fnFormatTime(),
      reviewers: log ? log.reviewers.join("\n_4_- ") : 'null'
    },
    (str) => {
      str = str.replace(/\n/g, "\\|");
      // str = str.replace(/\s{6}/g, "_2__2_");
      // str = str.replace(/\s{4}/g, "_2_");
      str = str.replace(/_4_/g, "_2__2_");
      str = str.replace(/_2_/g, "  ");
      str = str.replace(/\\\|/g, "\n");
      const objMatch = title.match(/(通过|拒绝)/);
      if (objMatch) {
        str = str.replace(/status: 进行中/, `status: ${objMatch[1]}`);
      }
      return str;
    }
  );
  // 插入 YML
  $(".pre-yml").text(`${styYML}`);
})();
