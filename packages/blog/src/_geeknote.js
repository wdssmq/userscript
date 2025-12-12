import { $n, _log } from "./_base";
import { gob } from "./_gob";

function fnGeekNote() {
  _log("[fnGeekNote()]");
  gob.setTags = (tags) => {
    const $select = $n("select.selector__select");
    // 移除所有 option
    $select.innerHTML = "";
    // const tpl = "<option value=\"-tag-\" selected=\"true\">-tag-</option>";
    tags.forEach((tag) => {
      const $option = document.createElement("option");
      $option.value = tag;
      $option.innerHTML = tag;
      $option.selected = true;
      $option.setAttribute("selected", "true");
      $select.appendChild($option);
    });
  };

  gob.setPost = () => {
    const { title, content, doc } = gob.dataPost();
    if (doc.title) {
      gob.$title.value = doc.title;
      gob.title = title || doc.title;
    }
    if (doc.tags) {
      const $input = $n("input.selector__input");
      $input.value = doc.tags.join(",");
      gob.setTags(doc.tags);
    }
    gob.$content.value = content;
  };

  gob.getPost = () => {
    if (!gob.$title || !gob.$content) {
      return;
    }
    gob.title = gob.$title.value;
    gob.content = gob.$content.value;
    // ----------
    gob.yml2json();
    gob.setPost();
    // ----------
    return gob.dataPost();
  };

  gob.bind = () => {
    // if (gob.$title) {
    //   gob.$title.addEventListener("input", () => {
    //     const post = gob.getPost();
    //     // _log("gob.bind()\n", post);
    //   });
    // }
    if (gob.$content) {
      gob.$content.addEventListener("change", () => {
        const post = gob.getPost();
        _log("[gob.bind()]\n", post);
      });
    }
  };

  gob.$title = $n("#post_title");
  gob.$content = $n("#post_content");

  gob.bind();
}

export default fnGeekNote;
