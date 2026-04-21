<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElCard
} from 'element-plus'
import { getUser, updateUser } from '../api/user'

interface User {
  userId: number
  username: string
  password: string
  nickname: string
  avatar: string
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const user = ref<User>({
  userId: 0,
  username: '',
  password: '',
  nickname: '',
  avatar: ''
})

// 获取用户ID
const userId = computed(() => {
  const id = route.params.userId
  return id ? Number(id) : 0
})

// 获取查询参数中的搜索条件
const searchQuery = computed(() => {
  return route.query.search as string || ''
})

// 加载用户数据
const loadUser = async () => {
  loading.value = true
  try {
    if (userId.value > 0) {
      const response = await getUser(userId.value)


      if (response.data) {
        // 检查响应格式
        if (typeof response.data === 'object' && 'code' in response.data) {
          // 格式: {code: 200, data: {...}, message: '...'}
          if (response.data.code === 200 && response.data.data) {
            user.value = { ...response.data.data }
            ElMessage.success(`已加载用户: ${user.value.nickname}`)
          } else {
            ElMessage.warning(`未找到用户ID: ${userId.value}`)
            // 清空表单
            user.value = { userId: 0, username: '', password: '', nickname: '', avatar: '' }
          }
        } else {
          // 格式: 直接返回用户对象
          user.value = { ...response.data }
          ElMessage.success(`已加载用户: ${user.value.nickname || user.value.username}`)
        }
      } else {
        ElMessage.warning(`未找到用户ID: ${userId.value}`)
        // 清空表单
        user.value = { userId: 0, username: '', password: '', nickname: '', avatar: '' }
      }
    } else {
      // 新建用户，清空表单
      user.value = { userId: 0, username: '', password: '', nickname: '', avatar: '' }
    }
  } catch (error: any) {
    console.error('加载用户失败:', error)

    if (error.response) {
      // 服务器响应了，但状态码不在 2xx 范围
      ElMessage.error(`加载失败: ${error.response.status} ${error.response.statusText}`)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else {
      // 请求配置出错
      ElMessage.error(`加载配置错误: ${error.message}`)
    }
  } finally {
    loading.value = false
  }
}

// 保存用户
const saveUser = async () => {
  saving.value = true
  try {
    if (userId.value > 0) {
      // 更新现有用户
      const response = await updateUser(userId.value, user.value)
      if (response.data.code === 200) {
        ElMessage.success('用户信息已保存')
        // 保存成功后返回查询页面，保持之前的搜索条件
        setTimeout(() => {
          goBack()
        }, 800) // 延迟800ms让用户看到保存成功的消息
      } else {
        ElMessage.error('保存失败')
      }
    } else {
      // 创建新用户（模拟）
      ElMessage.success('用户信息已保存（模拟）')
    }
  } catch (error: any) {
    console.error('保存用户失败:', error)

    if (error.response) {
      // 服务器响应了，但状态码不在 2xx 范围
      ElMessage.error(`保存失败: ${error.response.status} ${error.response.statusText}`)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else {
      // 请求配置出错
      ElMessage.error(`保存配置错误: ${error.message}`)
    }
  } finally {
    saving.value = false
  }
}

// 返回用户列表
const goBack = () => {
  // 返回用户查询页面，并传递之前的搜索条件
  router.push({
    path: '/UserQuery',
    query: {
      search: searchQuery.value
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadUser()
})
</script>

<template>
  <main class="user-edit-view">
    <ElCard class="edit-card">
      <template #header>
        <div class="card-header">
          <span>{{ userId ? '编辑用户' : '新建用户' }}</span>
          <div class="header-actions">
            <ElButton @click="goBack">返回列表</ElButton>
          </div>
        </div>
      </template>

      <ElForm
        :model="user"
        label-width="100px"
        class="user-form"
        v-loading="loading"
      >
        <ElFormItem label="用户ID">
          <ElInput
            v-model="user.userId"
            disabled
            placeholder="自动生成"
          />
        </ElFormItem>

        <ElFormItem label="用户名" required>
          <ElInput
            v-model="user.username"
            placeholder="请输入用户名"
            clearable
          />
        </ElFormItem>

        <ElFormItem label="密码" required>
          <ElInput
            v-model="user.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </ElFormItem>

        <ElFormItem label="昵称">
          <ElInput
            v-model="user.nickname"
            placeholder="请输入昵称"
            clearable
          />
        </ElFormItem>

        <ElFormItem label="头像URL">
          <ElInput
            v-model="user.avatar"
            placeholder="请输入头像URL"
            clearable
          />
        </ElFormItem>

        <ElFormItem>
          <ElButton
            type="primary"
            @click="saveUser"
            :loading="saving"
          >
            保存
          </ElButton>
          <ElButton @click="goBack" style="margin-left: 12px;">
            取消
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </main>
</template>

<style scoped>
.user-edit-view {
  padding: 20px;
}

.edit-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: 600;
}

.user-form {
  padding: 20px 0;
}
</style>