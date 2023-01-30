import axios from 'axios'
import config from '@/config/index'
import storage from '@/utils/storage'
import axiosRetry from 'axios-retry'
import qs from 'qs'
import Cookies from 'js-cookie'

// 最大请求次数
const RETRIES_NUM = 3
const NETWORK_ERROR = '网络请求异常，请稍后重试'

// 创建axios实例，添加全局配置
const service = axios.create({
  baseURL: config.baseUrl,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf8',
  },
})

// 请求拦截
service.interceptors.request.use((req) => {
  // 支持JWT认证
  // let token = storage.get('token') || ''
  // if (token) {
  //   req.headers.Authorization = 'Bearer ' + token
  // }

  if (req.method == 'post') {
    if (!Cookies.get('openid')) {
      Cookies.set('openid', 'otR84wb-MdGvfqllKYPSDkQi9cO0')
      // Cookies.set('openid', 'otR84wQJFDFk_ZCiCb9xyN1caqXI')
    }
    req.data.openid = Cookies.get('openid')
    // req.data.shenhe = 1

    if (process.env.NODE_ENV == 'development') {
      // req.data.development = 1
    }
    req.data = qs.stringify(req.data)
  }
  // 当重新请求次数超过了RETRIES_NUM的逻辑，比如可能需要清除登录状态
  if (req['axios-retry'].retryCount >= RETRIES_NUM) {
    // 清除登录状态
  }
  return req
})

// 响应拦截
service.interceptors.response.use(
  (res) => {
    const { status, data, error } = res.data
    // JWT
    if (res.headers.Authorization) {
      storage.set('token', res.headers.Authorization.split(' ')[1])
    }
    if (status !== undefined) {
      if (status == 200) {
        return data
      } else {
        vant.Toast.fail(error || NETWORK_ERROR)
        return Promise.reject(error || NETWORK_ERROR)
      }
    } else {
      return res.data
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 报错尝试重新请求
axiosRetry(service, {
  retries: RETRIES_NUM, // 尝试次数
  shouldResetTimeout: true, // 重置超时时间
  retryCondition: (error) => {
    // true为打开自动发送请求，false为关闭自动发送请求
    return true
  },
})

/**
 * post请求
 * @param {*} url 请求地址
 * @param {*} data 参数
 * @returns
 */
function post(url, data) {
  return service({
    url,
    method: 'post',
    data: data,
  })
}

/**
 * get请求
 * @param {*} url 请求地址
 * @param {*} params 参数
 * @returns
 */
function get(url, params) {
  return service({
    url,
    method: 'get',
    params,
  })
}

export default {
  post,
  get,
}
