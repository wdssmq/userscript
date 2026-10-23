class HttpRequest {
  get(url, headers = {}) {
    return this.request({
      method: "GET",
      url,
      headers,
    });
  }

  post(url, data = {}, headers = {}) {
    const formData = new FormData();

    for (const key in data) {
      formData.append(key, data[key]);
    }

    return this.request({
      method: "POST",
      url,
      data: formData,
      headers,
    });
  }

  // 以 JSON 字符串作为报文体，用于 odd_Later 这类读取 php://input 的接口
  postJson(url, obj = {}, headers = {}) {
    return this.request({
      method: "POST",
      url,
      data: JSON.stringify(obj),
      headers: Object.assign({ "Content-Type": "application/json" }, headers),
    });
  }

  request(options) {
    return new Promise((resolve, reject) => {
      const requestOptions = Object.assign({}, options);

      requestOptions.onload = (res) => {
        resolve(res);
      };

      requestOptions.onerror = (error) => {
        reject(error);
      };

      GM_xmlhttpRequest(requestOptions);
    });
  }
}

const http = new HttpRequest();

// 导出实例对象
export default http;
