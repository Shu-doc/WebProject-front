<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { adminLogin } from '../api/admin'

const router = useRouter()
const loading = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

const getResponseMessage = (payload: any) => payload?.msg || payload?.message || ''

const handleLogin = async () => {
  if (!loginForm.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!loginForm.value.password.trim()) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  try {
    const response = await adminLogin(loginForm.value.username, loginForm.value.password)
    const payload = response?.data
    if (payload?.code === 200) {
      const adminNickname = payload?.data?.adminNickname || payload?.data?.admin_nickname || loginForm.value.username
      localStorage.setItem('admin_nickname', adminNickname)
      localStorage.setItem('is_admin_login', 'true')
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(getResponseMessage(payload) || '登录失败')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    if (error.response) {
      if (error.response.status === 500) {
        ElMessage.error('后端服务异常（可能是数据库未初始化），请先检查并创建 admin 表')
        return
      }
      const serverMessage = error.response?.data?.message || error.response?.data?.msg
      ElMessage.error(serverMessage || `登录失败: ${error.response.status} ${error.response.statusText}`)
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else {
      ElMessage.error(`登录错误: ${error.message}`)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-avatar">
          <el-icon :size="40"><User /></el-icon>
        </div>
        <h1 class="login-title">管理员登录</h1>
        <p class="login-subtitle">请使用管理员账号登录系统</p>
      </div>
      <el-form
        :model="loginForm"
        label-width="0"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            clearable
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            clearable
            show-password
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            round
            style="width: 100%; height: 48px; font-size: 16px;"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/LoginImage.png') center/cover no-repeat;
}

/* 背景暗色遮罩 */
.login-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.login-card {
  position: relative;
  width: 420px;
  padding: 44px 40px 40px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-avatar {
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;
  background: linear-gradient(135deg, #409EFF 0%, #6366f1 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.35);
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px 0;
  letter-spacing: 2px;
}

.login-subtitle {
  font-size: 14px;
  color: #7a7a9a;
  margin: 0;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-input__wrapper) {
  height: 48px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: none !important;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #409EFF;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15) !important;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.login-form :deep(.el-button--primary) {
  background: linear-gradient(135deg, #409EFF 0%, #6366f1 100%);
  border: none;
  font-weight: 600;
  letter-spacing: 6px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-form :deep(.el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(64, 158, 255, 0.4);
}

.login-form :deep(.el-button--primary:active) {
  transform: translateY(0);
}
</style>
