import {
  _curUrl,
  _log,
  $n,
  $na,
  fnElChange,
} from "./_base";

import { gob } from "./_gob.js";

// 获取文章列表
const _getPostList = () => {
  if (_curUrl() !== "https://xlog.app/dashboard/wdssmq/posts") return;
  const $$postList = $na(".-mt-3 > a");
  // _log("postList", $$postList);

  if (!$$postList.length) return;

  const tplPostInfo = {
    date: "",
    slug: "",
    title: "",
    url: "",
  }

  gob.saveFlag = false;
  $$postList.forEach((el) => {
    const $title = el.querySelector(".xlog-post-title > span");
    const title = $title.innerText ? $title.innerText : "无标题";
    const url = el.href;
    const $warpDate = el.querySelector("div.xlog-post-meta + div");
    const date = $warpDate ? $warpDate.innerText : "";
    const postInfo = {
      ...tplPostInfo,
      date,
      title,
      url,
    };
    // 判断是否已经存在
    const pickPost = gob.postList.find((item) => item.url === postInfo.url);
    if (pickPost.slug && pickPost.slug !== "") {
      const $meta = el.querySelector(".xlog-post-meta");
      // 添加 slug 到页面，并使用 data 属性标记
      if ($meta && !el.dataset.xlogSlug) {
        const $slug = document.createElement("span");
        $slug.innerText = pickPost.slug;
        $slug.classList.add("text-lg", "ml-2", "text-accent");
        $meta.appendChild($slug);
        el.dataset.xlogSlug = pickPost.slug;
      }
    }
    if (pickPost) return;
    gob.postList.push(postInfo);
    gob.postCount = gob.postList.length;
    gob.saveFlag = true;
  });

  // 保存
  if (gob.saveFlag) {
    gob.save();
  }
}

// 更新具体文章信息
const _updatePostInfo = () => {
  const curUrl = _curUrl();
  if (curUrl.indexOf("https://xlog.app/dashboard/wdssmq/editor") === -1) return;

  const $slug = $n("#slug");
  // _log("slug", $slug);
  if (!$slug) return;
  const slug = $slug.value;

  const pickPost = gob.postList.find((item) => item.url === curUrl);
  if (!pickPost) return;

  if (pickPost.slug && pickPost.slug === slug) return;

  pickPost.slug = slug;
  gob.save();
  _log("pickPost", pickPost);

}

// 初始化

const _init = () => {
  const $app = $n("body");
  fnElChange($app, () => {
    _getPostList();
    _updatePostInfo();
  });
}

_init();
