import { get, post, request } from './http'

// 查询所有自习室
export const roomList = () => {
  return get('/room/all')
}

// 查询单个自习室
export const getRoom = (roomId) => {
  return get(`/room/get/${roomId}`)
}

// 更新自习室信息
export const updateRoom = (roomId, roomData) => {
  return post(`/room/update`, { ...roomData, roomId })
}

// 新增自习室
export const addRoom = (roomData) => {
  return post(`/room/create`, roomData)
}

// 删除自习室
export const deleteRoom = (roomId) => {
  return request({
    url: `/room/delete/${roomId}`,
    method: 'delete',
  })
}
