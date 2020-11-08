import { isPlainObject } from "./utils";

export function transformRequest(data: any): any {
  if (isPlainObject(data)) {
    return JSON.stringify(data);
  }
  return data;
}
//在我们不去设置 responseType 的情况下，当服务端返回给我们的数据是字符串类型，需要转换为JSON对象
export function transformResponse(data: any): any {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      // do nothing
    }
  }
  return data;
}
