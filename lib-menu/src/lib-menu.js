import "./styles.less";

// mturco/context-menu: A small JavaScript library for adding context menus to any HTML element
// https://github.com/mturco/context-menu

// Fires custom event on given element
function emit(el, type, data = {}) {
  const event = new CustomEvent(type, {
    detail: data,
  });
  el.dispatchEvent(event);
}

export default class mzLibMenu {
  constructor({
    items = [],
    options = {
      className: "",
      minimalStyling: false,
    },
  }) {
    this.items = [...items, {
      name: "关闭（close）",
      fn(cls) {
        cls.hide();
      },
    }];
    this.options = options;
    this.create();
  }

  // Creates DOM elements, sets up event listeners
  create() {
    // Create the menu
    this.menu = document.createElement("ul");
    this.menu.className = "mzLibMenu";
    // Create the menu items
    this.items.forEach((item, index) => {
      const li = document.createElement("li");

      if (!("name" in item)) {
        // Insert a divider
        li.className = "mzLibMenu-divider";
      } else {
        li.className = "mzLibMenu-item";
        li.innerHTML = item.name;
        li.setAttribute("data-ItemIndex", index);
        li.addEventListener("click", this.select.bind(this, li));
      }
      this.menu.appendChild(li);
    });
    //
    if (!this.options.minimalStyling) {
      this.menu.classList.add("mzLibMenu--theme-default");
    }
    if (this.options.className) {
      this.options.className
        .split(" ")
        .forEach(cls => this.menu.classList.add(cls));
    }

    // Add root element to the <body>
    document.body.appendChild(this.menu);

    // 创建后绑定事件
    this.on("created", () => {
      // console.log(this.menu);
      const $menu = this.menu;
      // ctrl + m
      document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.key === "m") {
          $menu.classList.toggle("is-open");
        }
      });
    });

    emit(this.menu, "created");
  }

  // Selects the given item and calls its handler
  select(item) {
    const itemId = item.getAttribute("data-ItemIndex");
    if (this.items[itemId]) {
      this.items[itemId].fn(this);
    }
    this.hide();
    emit(this.menu, "itemselected");
  }

  // hides the menu
  hide() {
    this.menu.classList.remove("is-open");
    emit(this.menu, "hidden");
  }

  // Convenience method for adding an event listener
  on(type, fn) {
    this.menu.addEventListener(type, fn);
  }

  // Convenience method for removing an event listener
  off(type, fn) {
    this.menu.removeEventListener(type, fn);
  }
}
