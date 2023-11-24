import { _log } from "./_base";

// 格式化 JSON
function formatJSON(obj) {
  let strJSON = JSON.stringify(obj);
  Object.keys(obj).forEach((key) => {
    const reg = new RegExp(`("${key}":)`);
    strJSON = strJSON.replace(reg, "\n$1 ");
  });
  // 花括号换行
  strJSON = strJSON.replace(/({)\n*/g, "$1\n");
  strJSON = strJSON.replace(/\n*(})/g, "\n$1");
  return strJSON;
}

// Tags 等特殊处理
function formatData(obj) {
  if (obj.Tags) {
    obj.Desc = obj.Desc.replace(obj.Tags.join(" "), "").trim();
    obj.Tags = obj.Tags.join(", ").replace(/#/g, "");
  }
  if (obj.Source) {
    // 为 yml 格式添加引号
    obj.Source = `"${obj.Source}"`;
  }
  // Desc 截取 59 个字符
  if (obj.Desc && obj.Desc.length > 59) {
    obj.Desc = obj.Desc.slice(0, 53) + "…";
  }
  return obj;
}

// 对象转 yaml
function formatYAML(obj) {
  let strYaml = "```yml\n";
  obj = formatData(obj);
  Object.keys(obj).forEach((key) => {
    strYaml += `${key}: ${obj[key]}\n`;
  });
  strYaml += "\n```";
  return strYaml;
}

// 添加复制按钮及事件的封装
function addCopyBtn($btnWrap, note, btnCon = "复制", copyType = "json") {
  const $btn = document.createElement("a");
  $btn.href = "javascript:;";
  $btn.classList.add("is-pulled-right");
  $btn.textContent = btnCon;
  $btn.title = btnCon;
  $btnWrap.appendChild($btn);
  // 由 copyType 决定复制的内容
  let copyText = "";
  if ("json" === copyType) {
    copyText = formatJSON(note);
  } else if ("yaml" === copyType) {
    copyText = formatYAML(note);
  }
  // 复制按钮事件
  $btn.addEventListener("click", () => {
    _log("copyText", copyText);
    GM_setClipboard(copyText);
    btnToggle($btn, "复制成功");
  });
}

// 按钮文本切换
function btnToggle($btn, text) {
  const tmp = $btn.text;
  $btn.text = text;
  setTimeout(() => {
    $btn.text = tmp;
  }, 3000);
}

export { formatJSON, formatYAML, addCopyBtn, btnToggle };
