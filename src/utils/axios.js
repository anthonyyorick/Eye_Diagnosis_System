import axios from 'axios'

// 创建 axios 实例
const service = axios.create({
  baseURL: 'http://8.134.237.189:8080', // 设置基础URL
  // baseURL:'http://10.21.236.116:8080',
  // baseURL:'/api',
  timeout: 30000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
    // 允许跨域
    'Access-Control-Allow-Origin': '*'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    return res
  },
  error => {
    console.error('响应错误：', error)
    return Promise.reject(error)
  }
)

export default service 