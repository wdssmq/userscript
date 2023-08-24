import { _log, $n, $na, fnElChange } from "./_base";

function fnLoad() {
  const $topBanner = $n(".Topstory > div");
  $topBanner.style.display = "none";
  fnHideVideos();
}

function fnHideVideos() {
  const $TopstoryList = $na(".TopstoryItem");
  // 循环并判断是否为视频
  for (let i = 0; i < $TopstoryList.length; i++) {
    const $Topstory = $TopstoryList[i];
    const $video = $Topstory.querySelector(".VideoAnswerPlayer");
    if ($video) {
      $Topstory.style.display = "none";
    }
  }
}

fnElChange($n("#root"), fnHideVideos);
fnLoad();

// ----------------------

const map = {
  closeBtn: "css-1x9te0t",
  mask: "css-18hmmtu",
};

// 点击遮罩关闭评论
$n("body").addEventListener("click", (e) => {
  const $tgt = e.target;
  if ($tgt.classList.contains(map.mask)) {
    const $closeBtn = $n(`.${map.closeBtn}`);
    $closeBtn.click();
  }
});
