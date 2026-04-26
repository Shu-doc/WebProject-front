import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/AdminLoginView.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/UserEdit/:userId?',
      name: 'UserEdit',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/UserEditView.vue'),
    },
    {
      path: '/UserQuery',
      name: 'UserQuery',
      component: () => import('../views/UserQueryView.vue'),
    },
    {
      path: '/UserAdd',
      name: 'UserAdd',
      component: () => import('../views/UserAddView.vue'),
    },
    {
      path: '/RoomQuery',
      name: 'RoomQuery',
      component: () => import('../views/RoomQueryView.vue'),
    },
    {
      path: '/RoomEdit/:roomId?',
      name: 'RoomEdit',
      component: () => import('../views/RoomEditView.vue'),
    },
    {
      path: '/RoomAdd',
      name: 'RoomAdd',
      component: () => import('../views/RoomAddView.vue'),
    },
  ],
})

// 路由守卫：未登录跳转到登录页
router.beforeEach((to) => {
  if (to.path === '/login') {
    return true
  }
  const isLogin = localStorage.getItem('is_admin_login') === 'true'
  if (!isLogin) {
    return '/login'
  }
  return true
})

export default router
