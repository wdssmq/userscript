// ==UserScript==
// @name         「Blog」写作助手
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  发布预定义文章到知乎、简书等平台
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.net/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://geeknote.net/*/dashboard/posts/new
// @match        https://geeknote.net/*/dashboard/posts/*/edit
// @match        http://localhost:3000/
// @grant        none
// @require      https://cdn.bootcdn.net/ajax/libs/js-yaml/4.1.0/js-yaml.min.js
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "blog-helper";

  // 初始常量或函数
  const curUrl = window.location.href;

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}]`, ...args);

  // -------------------------------------

  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }

  // localStorage 封装
  const lsObj = {
    setItem: function (key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    getItem: function (key, def = "") {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return def;
    },
  };

  // 数据读写封装
  const gobInfo = {
    // key: [默认值, 是否记录至 ls]
    $title: [null, false],
    $content: [null, false],
    title: ["", false],
    content: ["", false],
    doc: [{}, false],
    site: ["", false],
  };
  const gob = {
    _lsKey: `${gm_name}_data`,
    _bolLoaded: false,
    data: {},
    // 初始
    init() {
      // 根据 gobInfo 设置 gob 属性
      for (const key in gobInfo) {
        if (Object.hasOwnProperty.call(gobInfo, key)) {
          const item = gobInfo[key];
          this.data[key] = item[0];
          Object.defineProperty(this, key, {
            // value: item[0],
            // writable: true,
            get() { return this.data[key] },
            set(value) { this.data[key] = value; },
          });
        }
      }
      return this;
    },
    // 读取
    load() {
      if (this._bolLoaded) {
        return;
      }
      const lsData = lsObj.getItem(this._lsKey, this.data);
      _log("[gob.load()]\n", lsData);
      for (const key in lsData) {
        if (Object.hasOwnProperty.call(lsData, key)) {
          const item = lsData[key];
          this.data[key] = item;
        }
      }
      this._bolLoaded = true;
    },
    // 保存
    save() {
      const lsData = {};
      for (const key in gobInfo) {
        if (Object.hasOwnProperty.call(gobInfo, key)) {
          const item = gobInfo[key];
          if (item[1]) {
            lsData[key] = this.data[key];
          }
        }
      }
      _log("[log]gob.save()", lsData);
      lsObj.setItem(this._lsKey, lsData);
    },
    // 读取数据
    dataPost() {
      return {
        title: gob.title,
        content: gob.content,
        doc: gob.doc,
      };
    },
  };

  // 初始化
  gob.init().load();

  const fnGeekNote = () => {
    _log("[fnGeekNote()]");
    gob.setTags = (tags) => {
      const $select = $n("select.selector__select");
      // 移除所有 option
      $select.innerHTML = "";
      // const tpl = "<option value=\"-tag-\" selected=\"true\">-tag-</option>";
      tags.forEach((tag) => {
        const $option = document.createElement("option");
        $option.value = tag;
        $option.innerHTML = tag;
        $option.selected = true;
        $option.setAttribute("selected", "true");
        $select.appendChild($option);
      });
    };

    gob.setPost = () => {
      const { title, content, doc } = gob.dataPost();
      if (doc.title) {
        gob.$title.value = doc.title;
        gob.title = title || doc.title;
      }
      if (doc.tags) {
        const $input = $n("input.selector__input");
        $input.value = doc.tags.join(",");
        gob.setTags(doc.tags);
      }
      gob.$content.value = content;
    };

    gob.getPost = () => {
      if (!gob.$title || !gob.$content) {
        return;
      }
      gob.title = gob.$title.value;
      gob.content = gob.$content.value;
      // ----------
      gob.yml2json();
      gob.setPost();
      // ----------
      return gob.dataPost();
    };

    gob.bind = () => {
      // if (gob.$title) {
      //   gob.$title.addEventListener("input", () => {
      //     const post = gob.getPost();
      //     // _log("gob.bind()\n", post);
      //   });
      // }
      if (gob.$content) {
        gob.$content.addEventListener("change", () => {
          const post = gob.getPost();
          _log("[gob.bind()]\n", post);
        });
      }
    };

    gob.$title = $n("#post_title");
    gob.$content = $n("#post_content");

    gob.bind();
  };

  /* global jsyaml */

  gob.yml2json = () => {
    let content = gob.content;
    content = content.replace(/<!-- ---\n(?<yml>title:[\s\S]*?)\n--- -->\n\n/, "---\n$<yml>\n---\n\n");
    // _log("[gob.yml2json()]\n", content);
    const match = content.match(/---\n(?<yml>title:[\s\S]*?)\n---\n\n(?<con>[\s\S]*)/);
    // _log("gob.yml2json()\n", match);
    if (!match) {
      return;
    }
    const { yml, con } = match.groups;
    gob.doc = jsyaml.load(yml, "utf8");
    // tags 处理
    if (!gob.doc.tags) {
      gob.doc.tags = [];
    } else if (!Array.isArray(gob.doc.tags)) {
      gob.doc.tags = [gob.doc.tags];
    }
    // 处理 content
    content = `<!-- ---\n${yml}\n--- -->\n\n${con}`;
    gob.content = content;
  };

  gob.site = (() => {
    const list = ["jianshu", "csdn", "cnblogs", "geeknote"];
    let rlt = "";
    list.forEach((name) => {
      if (curUrl.indexOf(name) > -1) {
        rlt = name;
      }
    });
    return rlt;
  })();


  switch (gob.site) {
    case "geeknote":
      fnGeekNote();
      break;
  }

})();
