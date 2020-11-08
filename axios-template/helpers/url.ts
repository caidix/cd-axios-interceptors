import { isDate, isObject, isPlainObject } from "./utils";

// 将转义的字符转义回ASCII标的值
function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, "@")
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",")
    .replace(/%20/g, "+")
    .replace(/%5B/gi, "[")
    .replace(/%5D/gi, "]");
}

export function buildURL(url: string, params?: any) {
  if (!params) {
    return url;
  }
  const parts: string[] = [];
  Object.keys(params).forEach((key) => {
    let val = params[key];
    if (val === null || typeof val === "undefined") {
      return;
    }
    let values: string[];
    // 如果值为数组，键需要为 xx[]=value
    if (Array.isArray(val)) {
      values = val;
      key += "[]";
    } else {
      values = [val];
    }
    // 如果值为Date() ，需要toISOString， 如果为Object 需要stringify，最后encode
    values.forEach((val) => {
      if (isDate(val)) {
        val = val.toISOString();
      } else if (isPlainObject(val)) {
        val = JSON.stringify(val);
      }
      parts.push(`${encode(key)}=${encode(val)}`);
    });
  });

  // 合并
  const paramsmeleter = parts.join("&");
  // 若是存在传参，需要丢弃 url 中的哈希标记，如/base/get#hash --最终结果--> /base/get
  if (paramsmeleter) {
    const markIndex = url.indexOf("#");
    if (markIndex !== -1) {
      url = url.slice(0, markIndex);
    }
  }
  url += (url.indexOf("?") ? "?" : "&") + paramsmeleter;

  return url;
}
