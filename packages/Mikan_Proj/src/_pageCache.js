/* global Blazy */

import {
  $n,
  curDate,
  lsObj,
} from "./_base";

const CACHE_PREFIX = "mikanPageCache";
const CACHE_VERSION = 1;
const CACHE_TTL = 1000 * 86400;

const pageCache = {
  // 获取当前时间戳
  getNow() {
    // curDate.setTime(new Date().getTime());
    return curDate.getTime();
  },

  // 从日期链接获取页面元信息
  getPageMeta($dateLink, pageNo = 1) {
    const year = $dateLink.getAttribute("data-year") || "";
    const season = $dateLink.getAttribute("data-season") || "";
    // const seasonMap = {
    //   冬: 1,
    //   春: 2,
    //   夏: 3,
    //   秋: 4,
    // };

    return {
      pageNo,
      year,
      season,
      key: year && season ? `${year}-${season}` : `page-${pageNo}`,
    };
  },

  // 用于 lsObj 存储的键名
  getStorageKey(pageMeta) {
    return `${CACHE_PREFIX}:${pageMeta.key}`;
  },

  getBaseTemplate() {
    return {
      section: `
<div class="sk-bangumi" data-dayofweek="{{dayOfWeek}}">
    <div class="row">{{dayText}}</div>
    <div class="an-box animated fadeIn">
        <ul class="list-inline an-ul">{{items}}</ul>
    </div>
    <div class="is-clearfix"></div>
</div>
      `,
      item: `
<li>
    <span
        class="js-expand_bangumi b-lazy"
        data-bangumiid="{{bangumiId}}"
        data-src="{{imgSrc}}"
    ></span>
    <div class="an-info">
        <div class="an-info-group">
            <div class="date-text">{{dateText}}</div>
            <a
                href="/Home/Bangumi/{{bangumiId}}"
                target="_blank"
                class="an-text"
                title="{{title}}"
            >{{title}}</a>
        </div>
        <div
            class="an-info-icon js-subscribe_bangumi"
            data-subtitlegroupid=""
            data-bangumiid="{{bangumiId}}"
            data-toggle="tooltip"
            data-placement="bottom"
            title="订阅"
        ><i class="fa fa-rss "></i></div>
    </div>
</li>
      `,
    };
  },

  escapeHtml(text = "") {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  },

  replaceTpl(tpl = "", map = {}, rawKeys = []) {
    return tpl.replace(/\{\{(.*?)\}\}/g, (_match, key) => {
      const value = map[key] ?? "";
      if (rawKeys.includes(key)) {
        return String(value);
      }
      return this.escapeHtml(value);
    });
  },

  // 解析当前页面的番组信息，构造成一个结构化的对象
  parseSkBody() {
    const $skBody = $n("#sk-body");
    if (!$skBody) {
      return null;
    }
    let flagBadItem = false;

    const sections = [];
    const $sections = $skBody.querySelectorAll(":scope > .sk-bangumi");

    const _getImgSrc = ($span) => {
      // 如果有 data-src 属性，优先使用它
      const dataSrc = $span.getAttribute("data-src") || "";
      if (dataSrc) {
        return dataSrc;
      }
      // 否则从 style 属性的 background-image 中提取
      const style = $span.getAttribute("style") || "";
      const match = style.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/);
      return match ? match[1] : "";
    };

    $sections.forEach(($section) => {
      const curData = {
        dayOfWeek: -1,
        dayText: "",
        items: [],
      };

      // 区块信息
      const $row = $section.querySelector(":scope > .row");
      curData.dayOfWeek = $section.getAttribute("data-dayofweek") || "";
      curData.dayText = $row?.textContent.trim() || "";
      // 区块内的番组项
      const $items = $section.querySelectorAll(".an-ul > li");

      $items.forEach(($item) => {
        const $title = $item.querySelector(".an-text");
        const $span = $item.querySelector(".js-expand_bangumi");
        const $dateText = $item.querySelector(".date-text");
        const $subscribe = $item.querySelector(".js-subscribe_bangumi");
        if (!$span || !$dateText || !$title || !$subscribe) {
          return;
        }
        curData.items.push({
          title: $title.getAttribute("title") || "",
          // background-image 的图片链接
          imgSrc: _getImgSrc($span),
          bangumiId: $span.getAttribute("data-bangumiid") || "",
          dateText: $dateText.textContent.trim(),
        });
      });
      const badItems = curData.items.filter(item => !item.imgSrc);
      if (badItems.length > 0) {
        console.warn("解析到的番组项中有图片链接为空", badItems);
        flagBadItem = true;
      }
      sections.push(curData);
    });

    if (flagBadItem) {
      return null;
    }

    return {
      sections,
    };
  },

  renderSkBody($skBody, payload) {
    const template = this.getBaseTemplate();
    const sectionHTML = payload.sections.map((section) => {
      const itemsHTML = section.items.map(item => this.replaceTpl(template.item, item)).join("");
      return this.replaceTpl(template.section, {
        dayOfWeek: section.dayOfWeek,
        rowId: section.rowId,
        dayText: section.dayText,
        items: itemsHTML,
      }, ["items"]);
    }).join("");

    $skBody.innerHTML = sectionHTML;
    const _bLazy = new Blazy();
  },

  get(pageMeta) {
    const key = this.getStorageKey(pageMeta);
    const cache = lsObj.getItem(key, null);
    if (!cache || cache.version !== CACHE_VERSION || !cache.expireAt) {
      return null;
    }
    if (cache.expireAt <= this.getNow()) {
      localStorage.removeItem(key);
      return null;
    }
    return cache;
  },

  set(pageMeta, payload) {
    const key = this.getStorageKey(pageMeta);
    const cache = {
      version: CACHE_VERSION,
      expireAt: this.getNow() + CACHE_TTL,
      pageMeta,
      payload,
    };
    lsObj.setItem(key, cache);
  },

  // 如果命中缓存则渲染并返回 true，否则返回 false
  applyIfHit(pageNo, $dateLink, onHit = null, onMiss = null) {
    const $skBody = $n("#sk-body");
    const pageMeta = this.getPageMeta($dateLink, pageNo);
    // console.log("尝试从缓存加载页面数据，pageMeta:", pageMeta);
    const cache = this.get(pageMeta);
    if (!$skBody || !cache || !cache.payload) {
      if (typeof onMiss === "function") {
        onMiss();
      }
      return;
    }
    if (typeof onHit === "function") {
      onHit();
    }
    this.renderSkBody($skBody, cache.payload);
  },

  // 捕获当前页面数据并存入缓存
  capture(pageNo, $dateLink) {
    const pageMeta = this.getPageMeta($dateLink, pageNo);
    const payload = this.parseSkBody();
    // console.log("捕获页面数据，准备存入缓存，pageMeta:", pageMeta, "payload:", payload);
    if (!payload) {
      return false;
    }
    this.set(pageMeta, payload);
    return true;
  },
};

export default pageCache;
