import { _log, $n } from "./_base";

function fnReplace(params) {
  const { url, title } = params;
  // _log("fnReplace", params);
  const titleFilter = [
    // 贴吧
    [/^(.+吧-百度贴吧)--.+/, "$1"],
  ];
  const urlFilter = [
    // QQ
    ["?tdsourcetag=s_pctim_aiomsg", ""],
    // 哔哩哔哩
    [/\?spm_id_from=.+/, ""],
    [/\?vd_source=.+/, ""],
  ];
  let newTitle = title;
  let newUrl = url;
  titleFilter.forEach((item) => {
    newTitle = newTitle.replace(...item);
  });
  urlFilter.forEach((item) => {
    newUrl = newUrl.replace(...item);
  });
  if (location.host == "greasyfork.org") {
    newUrl = newUrl.replace(/(\/\d+)-.+/, "$1");
  }
  // _log("fnReplace", { url, title }, { newUrl, newTitle });
  return { url: newUrl, title: newTitle };
}

function fnGetInfo(md = false) {
  let { url, title } = fnReplace({
    url: document.location.href,
    title: document.title.trim(),
  });
  if (md) {
    // eslint-disable-next-line no-useless-escape
    title = title.replace(/([_\[\]])/g, "\\$1");
  }
  return [title, url];
}

GM_registerMenuCommand("复制", () => {
  const [title, url] = fnGetInfo();
  GM_setClipboard(title + "\n" + url);
});

GM_registerMenuCommand("复制 HTML", () => {
  const [title, url] = fnGetInfo();
  GM_setClipboard(
    `<p>${title}</p><p><a href="${url}" target="_blank" title="${title}">${url}</a></p>`,
  );
});

GM_registerMenuCommand("复制为 Markdown「text」", () => {
  const [title, url] = fnGetInfo(true);
  GM_setClipboard(`[${title}](${url} "${title}")`);
});

GM_registerMenuCommand("复制为 Markdown「link」", () => {
  const [title, url] = fnGetInfo(true);
  GM_setClipboard(`${title}：\n\n[${url}](${url} "${title}")`);
});

const tplMarkQuote = `
> {title}
>
> [{url}]({url} "{title}")
`;

GM_registerMenuCommand("复制为 Markdown「引用」", () => {
  const [title, url] = fnGetInfo(true);
  GM_setClipboard(tplMarkQuote.replace(/\{title\}/g, title).replace(/\{url\}/g, url));
});
