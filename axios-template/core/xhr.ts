import { AxiosRequestConfig, AxiosResponse, AxiosPromise } from "../types";
import { parseHeaders } from "../helpers/headers";
import { transformResponse } from "../helpers/data";
import { createError } from "../helpers/error";
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = "get",
      headers,
      responseType,
      timeout,
    } = config;
    const request = new XMLHttpRequest();
    if (responseType) {
      request.responseType = responseType;
    }
    if (timeout) {
      request.timeout = timeout;
    }
    // 对于一个正常的请求，往往会返回 200-300 之间的 HTTP 状态码，对于不在这个区间的状态码，我们也把它们认为是一种错误的情况做处理。
    function handleResponse(response: AxiosResponse) {
      if (response.status > 200 && response.status < 300) {
        resolve(response);
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        );
      }
    }
    request.onreadystatechange = function handleLoad() {
      if (request.readyState !== 4) {
        return;
      }
      /**
       * 只读属性 XMLHttpRequest.status 返回了XMLHttpRequest 响应中的数字状态码。
       * status 的值是一个无符号短整型。在请求完成前，status的值为0。值得注意的是，如果 XMLHttpRequest 出错，浏览器返回的 status 也为0。
       */
      if (request.status === 0) {
        return;
      }
      const responseHeaders = parseHeaders(request.getAllResponseHeaders());
      let responseData =
        responseType && responseType !== "text"
          ? request.response
          : request.responseText;
      const response: AxiosResponse = {
        data: transformResponse(responseData),
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request,
      };
      handleResponse(response);
    };
    request.open(method.toUpperCase(), url!, true);
    Object.keys(headers).forEach((name) => {
      if (data === null && name.toLowerCase() === "content-type") {
        delete headers[name];
      } else {
        request.setRequestHeader(name, headers[name]);
      }
    });
    request.send(data);
    // 当请求遇到错误时，将触发error 事件。
    request.onerror = function handleError() {
      reject(createError("Network Error", config, null, request));
    };
    // 进度由于预定时间到期而终止时，会触发timeout 事件。
    request.ontimeout = function handleTimeout() {
      reject(
        createError(
          "Timeout:" + timeout + "ms exceeded",
          config,
          "ECONNABORTED",
          request
        )
      );
    };
  });
}
