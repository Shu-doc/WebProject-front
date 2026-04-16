<script setup>
import { markRaw } from 'vue'
import { RouterView,useRouter } from 'vue-router'
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
    label: '测试2',
    icon: markRaw(User),
    children: [
      {
        label: '测试2-1',
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
</script>

<template>
  <el-container class="shell">
    <el-aside class="shell-aside" width="200px">
      <div class="brand">vue3-测试</div>
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
        <h1>标题一</h1>
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
