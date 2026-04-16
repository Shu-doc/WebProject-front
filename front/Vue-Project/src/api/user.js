import { get } from './http'

export const userList = () => {
  return get('/user/list')
}
