import {
  $n,
} from "./_base";

import type { noteInfo, INoteSite } from "./_type";


// Declare the type for window.__INITIAL_STATE__
interface BiliInitialState {
  bvid?: string;
}

// Extend the Window interface
declare global {
  interface Window {
    __INITIAL_STATE__?: BiliInitialState;
  }
}

export class BiliNote implements INoteSite {
  noteScheme = {
    item: {
      "Title": "node:.video-info-title-inner h1",
      "Desc": "node:.desc-info-text",
      "Source": "[url=https://space.bilibili.com/44744006]沉冰浮水@bilibili[/url]",
      "Tags": ["哔哩哔哩"],
      "Type": "视频",
      "Url": "",
    },
    btnWrap: ".video-info-meta",
  };

  _loadCheck() {
    const $btnSpan = $n(".js-note-btn");
    if ($btnSpan) return "loaded";
    const $title = $n(this.noteScheme.item.Title!.slice(5));
    const $desc = $n(this.noteScheme.item.Desc!.slice(5));
    if (!$title || !$desc) return "-1";
    return "loading";
  }

  _getVideoUrl() {
    return "https://www.bilibili.com/video/" + window.__INITIAL_STATE__?.bvid;
  }

  _getTitle() {
    return $n(this.noteScheme.item.Title!.slice(5))?.textContent?.trim() || "";
  }

  _getDesc() {
    return $n(this.noteScheme.item.Desc!.slice(5))?.textContent?.trim() || "";
  }

  get note(): noteInfo {
    const title = this._getTitle();
    const url = this._getVideoUrl();
    const desc = this._getDesc();
    return Object.assign({}, this.noteScheme.item, { Title: title, Url: url, Desc: desc }) as noteInfo;
  }
}



