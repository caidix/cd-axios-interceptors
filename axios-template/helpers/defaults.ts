import { AxiosRequestConfig } from "../types";
import { processHeaders } from "./headers";
import { transformRequest } from "./data";

const defaults: AxiosRequestConfig = {
  method: 'get',

  timeout: 0,

  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  },

  transformRequest: [
    function (data: any, headers: any): any {
      // 在这里对header
      processHeaders(headers, data)
      return transformRequest(data)
    }
  ],
  transformResponse: []
}

const methodsNoData = ['delete', 'get', 'head', 'options']

methodsNoData.forEach(method => {
  defaults.headers[method] = {}
})

const methodsWithData = ['post', 'put', 'patch']

methodsWithData.forEach(method => {
  defaults.headers[method] = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

export default defaults