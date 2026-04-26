<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElCard
} from 'element-plus'
import { addUser } from '../api/user'

interface User {
  userId: number  // 用户ID，由数据库自动生成，新增时前端应传递0或不传递
  username: string
  password: string
  nickname: string
  avatar: string
}

// 用于新增用户的数据接口
interface AddUserData {
  username: string
  password: string
  nickname?: string
  avatar?: string
}

const router = useRouter()
const saving = ref(false)
const user = ref<User>({
  userId: 0,
  username: '',
  password: '',
  nickname: '',
  avatar: ''
})

// 保存用户
const saveUser = async () => {
  // 表单验证
  if (!user.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!user.value.password.trim()) {
    ElMessage.warning('请输入密码')
    return
  }

  saving.value = true
  try {
    // 准备提交数据（ID由后端数据库自动生成）
    const submitData: AddUserData = {
      username: user.value.username.trim(),
      password: user.value.password.trim(),
      nickname: user.value.nickname.trim() || undefined,
      avatar: user.value.avatar.trim() || undefined
    }

    // 调用新增用户接口
    const response = await addUser(submitData)
    if (response.data.code === 200) {
      ElMessage.success('用户添加成功')
      // 成功后返回用户查询页面
      setTimeout(() => {
        goBack()
      }, 800)
    } else {
      ElMessage.error(`添加失败: ${response.data.message || '未知错误'}`)
    }
  } catch (error: any) {
    console.error('添加用户失败:', error)

    if (error.response) {
      // 服务器响应了，但状态码不在 2xx 范围
      ElMessage.error(`添加失败: ${error.response.status} ${error.response.statusText}`)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else {
      // 请求配置出错
      ElMessage.error(`添加配置错误: ${error.message}`)
    }
  } finally {
    saving.value = false
  }
}

// 返回用户列表
const goBack = () => {
  router.push('/UserQuery')
}
</script>

<template>
  <main class="user-add-view">
    <ElCard class="add-card">
      <template #header>
        <div class="card-header">
          <span>新增用户</span>
          <div class="header-actions">
            <ElButton @click="goBack">返回列表</ElButton>
          </div>
        </div>
      </template>

      <ElForm
        :model="user"
        label-width="100px"
        class="user-form"
      >
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
            确认添加
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
.user-add-view {
  padding: 20px;
}

.add-card {
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
