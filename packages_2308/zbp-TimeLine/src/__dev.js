// 本文件代码来自：https://github.com/lisonge/vite-plugin-monkey

 (({
  entryList = [],
  apiList = [],
}) => {
  const _unsafeWindow = window.unsafeWindow;
  if (_unsafeWindow) {
    Reflect.set(_unsafeWindow, "unsafeWindow", _unsafeWindow);
    const mountedApiList = [];
    const unMountedApiList = [];
    apiList.forEach((s) => {
      const fn = Reflect.get(window, s);
      if (fn) {
        Reflect.set(_unsafeWindow, s, fn);
        mountedApiList.push(s);
      } else {
        unMountedApiList.push(s);
      }
    });
    console.log(
      `[rollup-gm-loader] mount ${mountedApiList.length}/${apiList.length} GM_api to unsafeWindow`,
    );
    Reflect.set(_unsafeWindow, "__GM_api", {
      mountedApiList,
      unMountedApiList,
    });
  }
  const createScript = (src) => {
    const el = document.createElement("script");
    el.src = src;
    el.type = "module";
    el.dataset.source = "rollup-gm-loader";
    return el;
  };
  const { head } = document;
  entryList.reverse().forEach((s) => {
    head.insertBefore(createScript(s), head.firstChild);
  });
  console.log(
    `[rollup-gm-loader] mount ${entryList.length} module to document.head`,
  );
})({
  "entryList": [
    "placeholder.livereload.js",
    "placeholder.user.js",
  ],
  "apiList": [
    "GM",
    "GM_addElement",
    "GM_addStyle",
    "GM_addValueChangeListener",
    "GM_deleteValue",
    "GM_download",
    "GM_getResourceText",
    "GM_getResourceURL",
    "GM_getTab",
    "GM_getTabs",
    "GM_getValue",
    "GM_info",
    "GM_listValues",
    "GM_log",
    "GM_notification",
    "GM_openInTab",
    "GM_registerMenuCommand",
    "GM_removeValueChangeListener",
    "GM_saveTab",
    "GM_setClipboard",
    "GM_setValue",
    "GM_unregisterMenuCommand",
    "GM_xmlhttpRequest",
  ],
});
