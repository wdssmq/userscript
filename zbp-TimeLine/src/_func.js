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
  let strYaml = "";
  obj = formatData(obj);
  Object.keys(obj).forEach((key) => {
    strYaml += `${key}: ${obj[key]}\n`;
  });
  return strYaml;
}

function btnToggle($btn, text) {
  const tmp = $btn.text;
  $btn.text = text;
  setTimeout(() => {
    $btn.text = tmp;
  }, 3000);
}

export { formatJSON, formatYAML, btnToggle };
