import {
  $na,
  $n,
} from "./_base";

const fnSetRule = (gob, MiKanUrl) => {
  const $inputGroup = $n(".js-input-group.alignRight");
  if (!$inputGroup) {
    return;
  }
  $inputGroup.innerHTML = `
    <label>
      自动下载规则名称：
      <input type="text" class="js-rule-name" placeholder="规则名称" style="width: 120px; margin-right: 8px;">
    </label>
    <label>
      自动下载规则定义：
      <input type="text" class="js-rule-def" placeholder="正则表达式" style="width: 200px; margin-right: 8px;">
    </label>
    <button class="js-add-rule-btn">添加自动下载规则</button>
  `;
  const $btn = $n(".js-add-rule-btn");

  $btn.addEventListener("click", () => {
    const ruleName = $n(".js-rule-name").value.trim();
    const regRule = $n(".js-rule-def").value.trim();
    if (!ruleName || !regRule) {
      alert("请填写完整的规则名称和规则定义");
      return;
    }
    // 生成规则定义
    const ruleDef = {
      affectedFeeds: [MiKanUrl],
      assignedCategory: ruleName,
      enabled: true,
      mustContain: regRule,
      useRegex: true,
    };
    // 判断分类是否存在，不存在则创建
    if (!gob.data.categories.includes(ruleName)) {
      gob.apiCreateCategory(ruleName, () => {
        gob.data.categories.push(ruleName);
        _log(`已创建分类：${ruleName}`);
      });
    }
    setTimeout(() => {
      // 添加规则
      gob.apiRssSetRule(ruleName, JSON.stringify(ruleDef), () => {
        alert(`已添加自动下载规则：${ruleName} -> ${JSON.stringify(ruleDef)}`);
      });
    }, 500);
  });

}

export const registerRssAutoDlBtn = (gob, $rssBtn) => {
  if ($rssBtn.dataset.registered) {
    return;
  }

  let MiKanUrl = "";
  // 获取 RSS 订阅
  gob.apiRssFeeds((res) => {
    for (const name in res) {
      if (!Object.hasOwn(res, name)) continue;
      const item = res[name];
      // _log(name, item);
      if (name.includes("Mikan")) {
        MiKanUrl = item.url;
      }
    }
    // console.log(MiKanUrl);
  });

  // 获取分类列表
  gob.apiCategories((res) => {
    gob.data.categories = Object.keys(res);
  });

  $rssBtn.dataset.registered = "1";

  if ($n("button.js-set-rule")) {
    return;
  }

  // 用于插入表单的 div
  const div = document.createElement("div");
  div.classList.add("js-input-group", "alignRight");
  div.style.marginRight = "8px";
  div.style.display = "inline-block";
  // div.textContent = " （占位）";
  $n("#rssDownloaderButton").after(div);

  // #rssDownloaderButton 前添加一个按钮
  const btn = document.createElement("button");
  btn.innerHTML = "→ 添加自动下载规则 ←";
  btn.classList.add("alignRight", "js-set-rule");
  btn.style.marginRight = "4px";
  btn.addEventListener("click", () => {
    if (!MiKanUrl) {
      alert("未找到 Mikan RSS 订阅地址");
      return;
    }
    // 点击 Mikan 订阅行
    const $tr = Array.from($na("#rssFeedTableDiv tbody tr")).find((tr) => {
      return tr.textContent.includes("Mikan");
    });
    // console.log($tr);
    $tr.click();
    btn.classList.add("disabled", "mz-hidden");
    fnSetRule(gob, MiKanUrl);
  });
  $n("#rssDownloaderButton").after(btn);


}
