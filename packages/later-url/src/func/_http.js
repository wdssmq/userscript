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
