import { request } from './http'

// 管理员登录
export const adminLogin = (username, password) => {
  return request({
    url: '/admin/login',
    method: 'post',
    params: {
      adminAccount: username,
      adminPassword: password,
    },
  })
}
