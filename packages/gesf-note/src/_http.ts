import { GM_xmlhttpRequest } from "$";
import type { HttpRequestOptions } from "./_type";

// 定义 HTTP 请求类
class HttpRequest {
  constructor () {
    if (typeof GM_xmlhttpRequest === "undefined") {
      throw new Error("GM_xmlhttpRequest is not defined");
    }
  }

  get(url: string, headers: Record<string, string> = {}) {
    return this.request({
      method: "GET",
      url,
      headers,
    });
  }

  post(url: string, data: Record<string, any> = {}, headers: Record<string, string> = {}, dataType: string = "json") {

    const getData = (data: Record<string, any>): string | FormData => {
      switch (dataType) {
        case "form":
          const formData = new FormData();
          for (const key in data) {
            formData.append(key, data[key]);
          }
          headers["Content-Type"] = "application/x-www-form-urlencoded";
          return formData;
        case "json":
        default:
          headers["Content-Type"] = "application/json";
          return JSON.stringify(data);
      }
    };



    return this.request({
      method: "POST",
      url,
      data: getData(data),
      headers,
    });
  }

  request(options: { method: string; url: string; headers: Record<string, string>; data?: FormData | string; }) {
    return new Promise((resolve, reject) => {
      const requestOptions: HttpRequestOptions = Object.assign({}, options);

      requestOptions.onload = function(res) {
        resolve(res);
      };

      requestOptions.onerror = function(error) {
        reject(error);
      };

      GM_xmlhttpRequest(requestOptions);
    });
  }
}

// 导出实例对象
export const http = new HttpRequest();
