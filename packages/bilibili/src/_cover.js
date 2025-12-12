import { $n, $na, _log, _warn, fnElChange } from "./_base";
// 姑且引入一些大概会用到的函数 ↑

const $body = $n("body");

// 设置一个标记
let isDone = false;

// 用来实现实际功能的函数
function fnMain() {
  // 视频播放时页面一直在变化，所以这里会一直调用
  _warn("_cover => fnMain");
  const $listCover = $na(".header-history-video__image");
  // isDone 则控制这里只执行一次
  if ($listCover.length > 0 && !isDone) {
    isDone = true;
    Array.from($listCover).forEach(($cover, _index) => {
      // _warn(`.header-history-video__image[${index}] = `, $cover);
      // _warn("---");
      const $coverImg = $cover.querySelector("img");
      const $coverSource = $cover.querySelector("source");
      // src 或 srcset 属性
      let imgUrl = $coverImg.src;
      let imgSrcset = $coverSource.getAttribute("srcset");
      _warn("imgUrl = ", imgUrl);
      _warn("imgSrcset = ", imgSrcset);
      // 使用正则替换去除后边的内容
      imgUrl = imgUrl.replace(/@.+$/, "");
      imgSrcset = imgSrcset.replace(/@.+$/, "");
      // 设置回去
      $coverImg.src = imgUrl;
      $coverSource.setAttribute("srcset", imgSrcset);
    });
  }
}
// 当页面内容产生变化时，触发函数 fnMain
fnElChange($body, fnMain, false);
