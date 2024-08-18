import {
  $n,
} from "./_base";

class defForm {
  schemaForm = [
    // 替换
    {
      "name": "replace",
      "text": "替换",
      "inputs": [
        {
          "text": "旧 Tracker",
          "name": "origUrl",
        },
        {
          "text": "新 Tracker",
          "name": "newUrl",
        },
      ],
    },
    // 添加
    {
      "name": "add",
      "text": "添加",
      "inputs": [
        {
          "text": "添加 Tracker",
          "name": "trackerUrl",
        },
      ],
    },
    // 删除
    {
      "name": "remove",
      "text": "删除",
      "inputs": [
        {
          "text": "删除 Tracker",
          "name": "trackerUrl",
        },
      ],
    },
  ];

  $tab = null;
  $body = null;
  curSelect = null;
  curOption = null;

  // 初始
  constructor() {
    this.$tab = $n(".act-tab");
    this.$body = $n(".act-body");

    this.schemaForm.forEach((option) => {
      const { radioInput, label } = this.createRadioInput(option);
      this.$tab.appendChild(radioInput);
      this.$tab.appendChild(label);
      this.$tab.appendChild(document.createElement("br"));
    });
    this.updateFormBody("replace"); // Default load
  }

  createRadioInput(option) {
    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.id = option.name;
    radioInput.name = "action";
    radioInput.value = option.name;
    radioInput.dataset.text = option.text;
    // Default select "replace"
    if (option.name === "replace") radioInput.checked = true;

    const label = document.createElement("label");
    label.htmlFor = option.name;
    label.textContent = option.text;

    const _this = this;
    radioInput.addEventListener("change", function() {
      if (this.checked) {
        _this.updateFormBody(this.value);
      }
    });

    return { radioInput, label };
  }

  updateFormBody(selectedName) {
    const selectedOption = this.schemaForm.find(option => option.name === selectedName);
    this.$body.innerHTML = ""; // Clear current form

    selectedOption.inputs.forEach((input) => {
      const inputField = document.createElement("input");
      inputField.type = "text";
      inputField.name = input.name;
      inputField.placeholder = input.text;
      inputField.classList.add("js-input");

      const label = document.createElement("label");
      // label.textContent = input.text;
      label.appendChild(inputField);
      this.$body.appendChild(label);
      this.$body.appendChild(document.createElement("br"));
    });

    const $submit = document.createElement("input");
    $submit.value = selectedOption.text;
    $submit.type = "button";
    // 设置 class
    $submit.className = "btn btn-act";
    this.$body.appendChild($submit);

    this.curSelect = selectedName;
    this.curOption = selectedOption;
  }

  getFormData() {
    const data = {};
    this.curOption.inputs.forEach((input) => {
      const $input = $n(`.js-input[name="${input.name}"]`);
      if ($input) {
        data[input.name] = $input.value.trim();
      }
    });
    data.category = $n(".js-input[name=category]").value.trim();
    return data;
  }
}

export default defForm;
