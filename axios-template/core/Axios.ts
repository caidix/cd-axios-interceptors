import { AxiosRequestConfig, AxiosPromise, Method, AxiosResponse, ResolvedFn, RejectedFn } from "../types";
import dispatchRequest from "./dispatchRequest";
import InterceptorManager from "./interceptor";
import mergeConfig from "./mergeConfig";

interface Interceptor {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

interface InterceptorChain {
  resolved: ResolvedFn | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

export default class Axios {
  defaults: AxiosRequestConfig
  interceptor: Interceptor
  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptor = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }
  request(url: any, config?: AxiosRequestConfig): AxiosPromise {
    // 重载request传参
    let req: AxiosRequestConfig = {}
    if (typeof url === 'string') {
      req['url'] = url
    } else {
      req = url
    }
    // 合并config配置
    config = mergeConfig(this.defaults, config)
    const chain: InterceptorChain[] = [{
      resolved: dispatchRequest,
      rejected: undefined
    }]
    //  请求拦截器 ---> 请求 --->响应拦截器 （promise链式调用）
    // 请求前的拦截器，越是先注册，越靠后才执行
    this.interceptor.request.foreach((interceptor) => {
      chain.unshift(interceptor);
    })
    // 请求后的拦截器，越是后注册，越靠后才执行
    this.interceptor.response.foreach((interceptor) => {
      chain.push(interceptor)
    })
    let promise = Promise.resolve(req)
    while (chain.length) {
      const { resolved, rejected } = chain.shift()!
      promise = promise.then(resolved, rejected)
    }
    return promise as AxiosPromise
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData("get", url, config);
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData("delete", url, config);
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData("head", url, config);
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData("options", url, config);
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData("post", url, data, config);
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData("put", url, data, config);
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData("patch", url, data, config);
  }

  _requestMethodWithoutData(
    method: Method,
    url: string,
    config?: AxiosRequestConfig
  ) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
      })
    );
  }

  _requestMethodWithData(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data,
      })
    );
  }
}
