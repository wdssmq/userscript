/* eslint-disable */

(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    // localStorage 封装
    const lsObj = {
        setItem(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        getItem(key, def = "") {
            const item = localStorage.getItem(key);
            if (item) {
                return JSON.parse(item);
            }
            return def;
        },
    };

    // 独立模块：插入容器、文本框与可拖拽的可排序列表，双向同步（列表 <-> 文本框）
    const TEXT_CACHE_KEY = "lib-tag-sort:text";
    function createElement(tag, cls, text) {
        const el = document.createElement(tag);
        if (cls)
            el.className = cls;
        if (text !== undefined)
            el.textContent = text;
        return el;
    }
    function initSortableList() {
        // 避免重复初始化
        if (document.getElementById("tags-sortable-container"))
            return;
        // 容器
        const container = createElement("div", "tags-sortable-container");
        container.id = "tags-sortable-container";
        // 文本框（以逗号分隔）
        const textarea = createElement("textarea");
        textarea.placeholder = "用逗号分隔项目，例如：苹果, 香蕉, 橘子";
        const cacheText = lsObj.getItem(TEXT_CACHE_KEY, "苹果, 香蕉, 橘子");
        textarea.value = typeof cacheText === "string" ? cacheText : "苹果, 香蕉, 橘子";
        textarea.name = "tags";
        container.appendChild(textarea);
        // 列表容器
        const listWrap = createElement("div", "tags-list-wrap");
        const ul = createElement("ul");
        listWrap.appendChild(ul);
        container.appendChild(listWrap);
        document.body.appendChild(container);
        // 当前项数组
        let items = [];
        let fromIdx = -1;
        let toIdx = -1;
        // 渲染函数
        function render() {
            ul.innerHTML = "";
            items.forEach((it, idx) => {
                const li = createElement("li");
                li.draggable = true;
                li.dataset.index = String(idx);
                li.classList.add("tag-item");
                const text = createElement("span", "text", it);
                li.appendChild(text);
                const actions = createElement("div", "actions");
                const removeBtn = createElement("button", "delete-btn", "删除");
                removeBtn.type = "button";
                removeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    items.splice(idx, 1);
                    syncToTextarea();
                    render();
                });
                actions.appendChild(removeBtn);
                li.appendChild(actions);
                // 可直接点击编辑单项（双击）
                li.ondblclick = () => {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = it;
                    input.classList.add("edit-input");
                    li.innerHTML = "";
                    li.appendChild(input);
                    li.classList.add("editing");
                    input.focus();
                    // 失焦或按回车保存修改，按 Esc 取消修改
                    input.onblur = () => {
                        items[idx] = input.value.trim();
                        syncToTextarea();
                        render();
                    };
                    input.onkeydown = (e) => {
                        if (e.key === "Enter")
                            e.target.blur();
                        if (e.key === "Escape")
                            render();
                    };
                };
                // 拖拽事件
                li.addEventListener("dragstart", (e) => {
                    // 任一项处于编辑态时，禁止拖拽排序
                    if (ul.querySelector(".editing")) {
                        e.preventDefault();
                        return;
                    }
                    li.classList.add("dragging");
                    fromIdx = idx;
                    // 以 move 为默认效果
                    if (e.dataTransfer)
                        e.dataTransfer.effectAllowed = "move";
                });
                li.addEventListener("dragend", () => {
                    li.classList.remove("dragging");
                    removePlaceholder();
                });
                li.addEventListener("dragover", (e) => {
                    e.preventDefault();
                    const dragging = ul.querySelector(".dragging");
                    if (!dragging || dragging === li)
                        return;
                    // 在当前 li 插入占位（根据鼠标位置决定插入前或后）
                    const curIdx = Number(li.dataset.index);
                    if (Number.isNaN(curIdx))
                        return;
                    const rect = li.getBoundingClientRect();
                    const halfway = rect.top + rect.height / 2;
                    if (e.clientY < halfway) {
                        toIdx = curIdx - 1;
                        toIdx !== fromIdx
                            && insertPlaceholder(li, "before");
                    }
                    else {
                        toIdx = curIdx + 1;
                        toIdx !== fromIdx
                            && insertPlaceholder(li, "after");
                    }
                });
                ul.appendChild(li);
            });
        }
        function syncToTextarea() {
            // 去除空元素并保留顺序
            textarea.value = items.filter(s => s.trim() !== "").map(s => s.trim()).join(", ");
            lsObj.setItem(TEXT_CACHE_KEY, textarea.value);
        }
        // 文本框 -> 列表
        textarea.addEventListener("input", () => {
            const raw = textarea.value.replace(/[，+|]/g, ",");
            lsObj.setItem(TEXT_CACHE_KEY, raw);
            if (raw.trim() === "") {
                removeSelf();
                return;
            }
            items = raw.split(",").map(s => s.trim()).filter(s => s.length > 0);
            render();
            container.style.width = `${400 + items.length * 15}px`;
        });
        // 初始解析并渲染
        items = textarea.value.split(",").map(s => s.trim()).filter(s => s.length > 0);
        render();
        // 占位管理
        function removePlaceholder() {
            const ph = ul.querySelector(".placeholder");
            if (ph)
                ph.remove();
        }
        function insertPlaceholder(el, position = "before") {
            const elIdx = el.dataset.index;
            const phID = `${position}-${elIdx}`;
            if (document.getElementById(phID)) {
                return;
            }
            removePlaceholder();
            const ph = createElement("li", "placeholder");
            ph.className = "placeholder";
            ph.id = phID;
            // console.log(phID);
            // 使用现代插入语法：Element.before / Element.after
            if (position === "before") {
                // 在目标元素之前插入
                el.before(ph);
            }
            else {
                // 在目标元素之后插入
                el.after(ph);
            }
            ph?.addEventListener("drop", dropHandle);
        }
        // drop 事件处理
        function dropHandle(e) {
            e.preventDefault();
            const moved = items[fromIdx];
            items = items.toSpliced(fromIdx, 1);
            if (toIdx > fromIdx) {
                items.splice(toIdx - 1, 0, moved);
            }
            else {
                items.splice(toIdx + 1, 0, moved);
            }
            syncToTextarea();
            render();
        }
        document.addEventListener("dragover", (e) => {
            // console.log((e.target as Element)?.closest?.('.tags-list-wrap'));
            if (e.target?.closest?.(".tags-list-wrap")) {
                e.preventDefault();
            }
        });
        // 移除
        function removeSelf() {
            if (container)
                container.remove();
        }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z = "#tags-sortable-container, #tags-sortable-container * {\n  box-sizing: border-box;\n}\n\n#tags-sortable-container {\n  font-size: 14px;\n  margin: 12px;\n  max-width: 600px;\n}\n#tags-sortable-container textarea {\n  width: 100%;\n  height: 60px;\n  box-sizing: border-box;\n  padding: 6px;\n  outline: none;\n}\n#tags-sortable-container input[type=text] {\n  padding: 6px;\n  outline: none;\n  border: 1px solid #bbb;\n  border-radius: 4px;\n}\n#tags-sortable-container ul {\n  list-style: none;\n  padding: 0;\n  margin: 8px 0;\n  border: 1px solid #ddd;\n  min-height: 40px;\n}\n#tags-sortable-container li {\n  height: 36.4px;\n  padding: 11.2px 10px;\n  border-bottom: 1px solid #ddd;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  background: #fff;\n  cursor: grab;\n}\n#tags-sortable-container li .text, #tags-sortable-container li .edit-input {\n  flex: 1;\n}\n#tags-sortable-container li .actions {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n}\n#tags-sortable-container li .delete-btn {\n  border: 1px solid #bbb;\n  background: #fff;\n  color: #666;\n  padding: 2px 8px;\n  border-radius: 4px;\n  cursor: pointer;\n}\n#tags-sortable-container li .delete-btn:hover {\n  color: #c00;\n  border-color: #c88;\n}\n#tags-sortable-container li.dragging {\n  opacity: 0.5;\n}\n#tags-sortable-container li .handle {\n  width: 16px;\n  height: 16px;\n  background: #ccc;\n  display: inline-block;\n  border-radius: 2px;\n  cursor: grab;\n}\n#tags-sortable-container li.tag-item:last-child {\n  border-bottom: none;\n}\n#tags-sortable-container .placeholder {\n  height: 29.12px;\n  border: 2px dashed #bbb;\n  margin: 4px 0;\n}";
    styleInject(css_248z);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSortableList);
    }
    else {
        initSortableList();
    }

}));
