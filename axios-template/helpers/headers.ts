import { isPlainObject, deepMerge } from "./utils";
import { Method } from "../types";

function normalizeHeaderName(headers: any, normalizedName: string): void {
  if (!headers) {
    return;
  }
  Object.keys(headers).forEach((name) => {
    if (
      name !== normalizedName &&
      name.toLowerCase() === normalizedName.toLowerCase()
    ) {
      headers[normalizedName] = headers[name];
      delete headers[name];
    }
  });
}

export function processHeaders(headers: any, data: any): any {
  normalizeHeaderName(headers, "Content-Type");

  if (isPlainObject(data)) {
    if (headers && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json;charset=utf-8";
    }
  }
  return headers;
}

// 由于request.getAllResponseHeaders()获取的是一个长串的JSON字符串，所以需要讲其拆拼成JSON对象类型
export function parseHeaders(headers: string): any {
  let parsed = Object.create(null);
  if (!headers) return;
  headers.split("\r\n").forEach((item) => {
    let [key, value] = item.split(":");
    key = key.trim().toLowerCase();
    if (!key) {
      return;
    }
    if (value) {
      value = value.trim();
    }
    parsed[key] = value;
  });
  return parsed;
}
// 将common \ method 属性内的属性扁平到headers里，再将common\method属性删除
export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) return headers
  headers = deepMerge(headers.common || {}, headers[method] || {}, headers)
  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']
  methodsToDelete.forEach(method => {
    delete headers[method]
  })
}