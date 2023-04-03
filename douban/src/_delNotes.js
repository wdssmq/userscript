import { _log, _warn, $, curUrl, _curUrl } from "./_base";
import { gob } from "./_gob";

const fnCheckKeep = (info) => {
  const { url } = info;
  const { keepList } = gob;
  // [{ url: "https://www.douban.com/note/1234567/" }, ...]
  const bolKeep = keepList.some(item => item.url === url);
  return bolKeep;
};

const fnAddKeep = (info) => {
  const { keepList } = gob;
  keepList.push(info);
  gob.keepList = keepList;
  gob.save();
};

const fnSavePageUrl = () => {
  gob.lstPageUrl = curUrl;
  gob.save();
};

const fnCheckPageUrl = (goto = false) => {
  let { lstPageUrl } = gob;
  // 移除掉 &_i=xxx
  const curUrl = _curUrl().replace(/&_i=.+/, "");
  lstPageUrl = lstPageUrl.replace(/&_i=.+/, "");
  // 调试
  _log("fnCheckPageUrl", { lstPageUrl, curUrl });

  if (lstPageUrl === curUrl || !lstPageUrl) {
    return true;
  }
  if (goto) {
    window.location.href = lstPageUrl;
  }
  return false;
};

const fnGetNotes = () => {
  const $$notes = $(".note-container");
  // _log("fnGetNotes", $$notes);
  return $$notes;
};

// fnGetNotes();

const fnSetKeep = ($note, info) => {
  const tplKeep = "「保留」<a href=\"-url-\" title=\"-title-\">-title-</a>";
  $note.html(tplKeep
    .replace(/-url-/g, info.url)
    .replace(/-title-/g, info.title));
  return;
};

const fnDelNotes = () => {
  fnCheckPageUrl(true);
  const $$notes = fnGetNotes();
  let delRunning = false;
  // 循环删除
  $$notes.each(function () {
    // 如果正在删除，则跳过
    if (delRunning) {
      return;
    }
    // 元素节点
    const $note = $(this);
    const $noteTitle = $note.find("h3>a");
    const $noteFooter = $note.find(".note-ft");
    const $noteSNS = $note.find(".sns-bar");
    const $delBtn = $note.find(".note-footer-stat-del a");
    // _log($allBtn);
    // 日志信息
    const noteInfo = {
      title: $noteTitle.text(),
      url: $note.data("url"),
    };
    // 判断
    const bolKeep = fnCheckKeep(noteInfo);
    if (bolKeep) {
      fnSetKeep($note, noteInfo);
      return;
    }
    // 添加按钮用于设置保留
    const tplKeep = "- 「<a href=\"javascript:;\" class=\"keep-btn\">设为保留</a>」";
    $noteTitle.after(tplKeep);
    // 点击保留按钮
    $note.find(".keep-btn").click(function () {
      const bolConfirm = confirm(`是否保留笔记：${noteInfo.title}`);
      if (!bolConfirm) {
        return;
      }
      fnSavePageUrl();
      fnAddKeep(noteInfo);
      fnSetKeep($note, noteInfo);
    });
    // 隐藏时间
    const $pubDate = $note.find(".pub-date").parent();
    $pubDate.hide();
    // 隐藏 SNS
    $noteSNS.before("<hr>");
    $noteSNS.hide();
    // 显示删除按钮
    $noteFooter.show().prepend("<br>");
    // // 点击删除按钮
    // $delBtn[0].click();
    // delRunning = true;
    _log("fnDelNote", $delBtn, noteInfo);
  });
};

fnDelNotes();


