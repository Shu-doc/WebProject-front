<script setup>
import { markRaw, ref, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { House, User, Setting, SwitchButton, Grid } from '@element-plus/icons-vue'

const router = useRouter()

const handleMenuSelect = (index) => {
  router.push(index)
}

const menus = [
  {
    label: '首页',
    path: '/',
    icon: markRaw(House)
  },
  {
    label: '用户管理',
    icon: markRaw(User),
    children: [
      {
        label: '查询所有用户',
        path: '/test2-1',
        icon: markRaw(Grid)
      },
      {
        label: '测试2-2',
        path: '/about',
        icon: markRaw(Setting)
      }
    ]

  }
]

// 退出登录函数
const logout = () => {
  console.log('退出登录')
  // TODO: 实现退出登录逻辑
}

// 当前路由路径
const route = useRoute()
const activePath = ref(route.path)

// 当前时间
const currentTime = ref('')

// 格式化时间函数
const formatCurrentTime = () => {
  const now = new Date()
  const timezoneOffsetMinutes = now.getTimezoneOffset() // 本地时间与UTC的分钟差，UTC - 本地时间
  const offsetHours = Math.floor(Math.abs(timezoneOffsetMinutes) / 60)
  const offsetMinutes = Math.abs(timezoneOffsetMinutes) % 60
  const timezoneSign = timezoneOffsetMinutes <= 0 ? '+' : '-' // 东区为+，西区为-

  // 格式化时区偏移为 HH:MM
  const timezoneStr = `${timezoneSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`

  return `${now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })} (UTC${timezoneStr})`
}

// 更新时间
const updateTime = () => {
  currentTime.value = formatCurrentTime()
}

// 设置定时器每秒更新
let timer = null
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <el-container class="shell">
    <el-aside class="shell-aside" width="200px">
      <div class="brand">管理员系统</div>
      <el-menu :default-active="activePath" class="menu" @select="handleMenuSelect">
        <template v-for="item in menus" :key="item.path">
          <el-sub-menu v-if="item.children?.length" :index="item.path">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </template>

            <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.label }}</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="shell-header">
        <h1>{{ currentTime }}</h1>
        <div class="header-actions">
          <el-tag type="info" effect="dark">当前用户：张三</el-tag>
          <el-button type="danger" plain :icon="SwitchButton" @click="logout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="shell-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>

</template>

<style scoped>
</style>
