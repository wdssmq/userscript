class HttpRequest {
  constructor() {
    if (typeof GM_xmlhttpRequest === 'undefined') {
      throw new Error('GM_xmlhttpRequest is not defined');
    }
  }

  get(url, headers = {}) {
    return this.request({
      method: 'GET',
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
      method: 'POST',
      url,
      data: formData,
      headers,
    });
  }

  request(options) {
    return new Promise((resolve, reject) => {
      const requestOptions = Object.assign({}, options);

      requestOptions.onload = function (res) {
        resolve(res);
      };

      requestOptions.onerror = function (error) {
        reject(error);
      };

      GM_xmlhttpRequest(requestOptions);
    });
  }
}

// 导出实例对象
export const http = new HttpRequest();
