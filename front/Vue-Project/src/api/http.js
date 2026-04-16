import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
console.log('HTTP 模块初始化，API基础URL:', apiBaseUrl)

const service = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
})

// 添加请求拦截器
service.interceptors.request.use(
  (config) => {
    console.log('🚀 发起请求:', {
      url: config.baseURL + config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      headers: config.headers,
    })
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
service.interceptors.response.use(
  (response) => {
    console.log('✅ 收到响应:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    })
    return response
  },
  (error) => {
    console.error('❌ 响应拦截器错误:')

    if (error.response) {
      console.error('响应错误详情:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.response.config?.url,
      })
    } else if (error.request) {
      console.error('请求错误 - 无响应:', {
        message: error.message,
        request: error.request,
      })
      console.error('可能原因: 1) 后端服务未启动, 2) 跨域问题, 3) 网络问题')
    } else {
      console.error('配置错误:', error.message)
    }

    return Promise.reject(error)
  }
)

export const request = (options) => {
  return service(options)
}

export const get = (url, params, config = {}) => {
  return request({
    url,
    method: 'get',
    params,
    ...config,
  })
}

export const post = (url, data, config = {}) => {
  return request({
    url,
    method: 'post',
    data,
    ...config,
  })
}

export default {
  request,
  get,
  post
}
