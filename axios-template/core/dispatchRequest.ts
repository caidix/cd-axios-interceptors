import { AxiosPromise, AxiosRequestConfig } from "../types";
import xhr from "./xhr";
import { buildURL } from "../helpers/url";
import { transformRequest } from "../helpers/data";
import { processHeaders, flattenHeaders } from "../helpers/headers";
import transform from "./transform";

export default function dispatchRequest(
  config: AxiosRequestConfig
): AxiosPromise {
  processConfig(config);
  return xhr(config);
}

// function processConfig(config: AxiosRequestConfig): void {
//   config.url = transformURL(config);
//   config.headers = transformHeaders(config);
//   config.data = transformRequestData(config);
//   config.headers = flattenHeaders(config.headers, config.method!)
// }

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config);
  config.data = transform(config.data, config.headers, config.transformRequest);
  config.headers = flattenHeaders(config.headers, config.method!);
}

function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config;
  return buildURL(url!, params);
}

function transformRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data);
}
