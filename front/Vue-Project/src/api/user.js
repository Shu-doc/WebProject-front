import { get, post, request } from './http'

export const userList = () => {
  return get('/user/list')
}

// 获取单个用户
export const getUser = (userId) => {
  // 实际调用接口 /user/{id}
  return get(`/user/${userId}`)
}

// 更新用户
export const updateUser = (userId, userData) => {
  return post(`/user/update`, userData)
}

// 删除用户
export const deleteUser = (userId) => {
  // 实际调用接口 /user/delete/{id}
  return request({
    url: `/user/delete/${userId}`,
    method: 'delete'
  })
}
