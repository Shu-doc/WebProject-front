<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userList, getUser, deleteUser } from '../api/user'
import {
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElMessage,
  ElMessageBox,
  ElInput,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem
} from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

interface User {
  userId: number
  username: string
  password: string
  nickname: string
  avatar: string
}

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const searchUserId = ref('')
const users = ref<User[]>([])
const currentPage = ref(1)
const pageSize = ref(50)

const fetchUsers = async () => {
  // 验证输入
  if (searchUserId.value.trim() && !/^\d+$/.test(searchUserId.value.trim())) {
    ElMessage.warning('用户ID必须是数字')
    return
  }

  try {
    loading.value = true

    if (searchUserId.value.trim()) {
      // 查询单个用户
      const userId = searchUserId.value.trim()

      const response = await getUser(userId)

      if (response.data) {
        // 检查响应格式
        if (typeof response.data === 'object' && 'code' in response.data) {
          // 格式: {code: 200, data: {...}, message: '...'}
          if (response.data.code === 200) {
            if (response.data.data) {
              // 单个用户放入数组
              users.value = [response.data.data]
              ElMessage.success(`成功获取用户: ${response.data.data.nickname}`)
            } else {
              users.value = []
              ElMessage.warning(`未找到用户ID: ${userId}`)
            }
          } else {
            users.value = []
            ElMessage.error(response.data.message || `查询失败，错误码: ${response.data.code}`)
            console.error('接口返回错误码:', response.data)
          }
        } else {
          // 格式: 直接返回用户对象
          users.value = [response.data]
          ElMessage.success(`成功获取用户: ${response.data.nickname || response.data.username}`)
        }
      } else {
        users.value = []
        ElMessage.error('响应数据为空')
        console.error('响应数据为空:', response)
      }
    } else {
      // 查询所有用户
      const response = await userList()

      if (response.data) {
        // 检查响应格式
        if (typeof response.data === 'object' && 'code' in response.data) {
          // 格式: {code: 200, data: [...], message: '...'}
          if (response.data.code === 200) {
            const userData = response.data.data || []
            users.value = userData
            ElMessage.success(`成功获取 ${userData.length} 个用户`)
          } else {
            console.error('接口返回错误:', response.data)
            ElMessage.error(response.data.message || `查询失败，错误码: ${response.data.code}`)
            users.value = []
          }
        } else if (Array.isArray(response.data)) {
          // 格式: 直接返回用户数组
          users.value = response.data
          ElMessage.success(`成功获取 ${response.data.length} 个用户`)
        } else {
          // 未知格式
          console.error('接口返回格式不正确:', response.data)
          ElMessage.error('接口返回格式不正确')
          users.value = []
        }
      } else {
        console.error('响应数据为空:', response)
        ElMessage.error('响应数据为空')
        users.value = []
      }
    }

  } catch (error: unknown) {
    console.error('获取用户列表失败:', error)

    // 类型安全的错误处理
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number; statusText: string; data: any } }
      // 服务器响应了，但状态码不在 2xx 范围
      console.error('响应错误 - 状态码:', axiosError.response?.status)
      console.error('响应错误 - 数据:', axiosError.response?.data)
      ElMessage.error(`请求失败: ${axiosError.response?.status} ${axiosError.response?.statusText}`)
    } else if (error && typeof error === 'object' && 'request' in error) {
      // 请求已发出，但没有收到响应
      console.error('请求错误 - 可能是网络问题或跨域问题')
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else if (error instanceof Error) {
      // 请求配置出错
      console.error('配置错误:', error.message)
      ElMessage.error(`请求配置错误: ${error.message}`)
    } else {
      // 未知错误类型
      console.error('未知错误:', error)
      ElMessage.error('发生未知错误')
    }
  } finally {
    loading.value = false
  }
}

// 计算分页后的数据
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return users.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(users.value.length / pageSize.value)
})

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const handleEdit = (userId: number) => {
  // 传递当前搜索条件，以便返回时保持查询状态
  router.push({
    path: `/UserEdit/${userId}`,
    query: {
      search: searchUserId.value || ''
    }
  })
}

const handleDelete = async (userId: number) => {
  try {
    // 确认删除
    await ElMessageBox.confirm(
      `确定要删除用户ID为 ${userId} 的用户吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )

    // 用户确认删除，执行删除操作
    const response = await deleteUser(userId)

    if (response.data.code === 200) {
      ElMessage.success('用户删除成功')
      // 删除后刷新用户列表
      fetchUsers()
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error: unknown) {
    // 如果用户取消删除，会抛出 reject，这里捕获但不处理
    if (typeof error === 'string' && (error === 'cancel' || error === 'close')) {
      return
    }

    console.error('删除用户失败:', error)

    // 类型安全的错误处理
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number; statusText: string; data: any } }
      // 服务器响应了，但状态码不在 2xx 范围
      ElMessage.error(`删除失败: ${axiosError.response?.status} ${axiosError.response?.statusText}`)
    } else if (error && typeof error === 'object' && 'request' in error) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else if (error instanceof Error) {
      // 请求配置出错
      ElMessage.error(`删除配置错误: ${error.message}`)
    } else {
      // 未知错误类型
      console.error('未知错误:', error)
      ElMessage.error('删除用户时发生未知错误')
    }
  }
}

const handleDropdownCommand = (command: string, userId: number) => {
  if (command === 'edit') {
    handleEdit(userId)
  } else if (command === 'delete') {
    handleDelete(userId)
  }
}

// 页面加载时根据路由参数自动查询
onMounted(() => {
  // 检查路由查询参数中是否有搜索条件
  const searchFromRoute = route.query.search as string
  if (searchFromRoute) {
    searchUserId.value = searchFromRoute
  }
  // 执行查询（会自动根据searchUserId.value的值决定查询单个还是所有用户）
  fetchUsers()
})

</script>

<template>
  <main class="test2-1-view">
    <div class="header">
      <div class="header-top">
        <h1>用户管理</h1>
        <div class="search-area">
          <el-input
            v-model="searchUserId"
            placeholder="输入用户ID查询单个用户"
            size="small"
            style="width: 200px; margin-right: 8px;"
            clearable
            @keyup.enter="fetchUsers"
          />
          <el-button
            type="primary"
            size="small"
            :loading="loading"
            @click="fetchUsers"
            icon="Search"
            class="query-btn"
          >
            查询
          </el-button>
        </div>
      </div>
      <p class="subtitle">{{ searchUserId ? '按用户ID查询' : '查询并显示所有用户信息' }}</p>
    </div>

    <div class="stats-container" v-if="users.length > 0">
      <div class="stats">
        <span class="stat-item">总用户数: {{ users.length }}</span>
        <span class="stat-item">当前页: {{ currentPage }}/{{ totalPages }}</span>
        <span class="stat-item">每页: {{ pageSize }} 条</span>
      </div>
    </div>

    <div class="content" v-if="users.length > 0">
      <el-table
        :data="paginatedUsers"
        stripe
        style="width: 100%"
        border
        v-loading="loading"
      >
        <el-table-column
          prop="userId"
          label="用户ID"
          width="100"
          align="center"
        />
        <el-table-column
          prop="username"
          label="用户名"
          min-width="150"
        />
        <el-table-column
          prop="nickname"
          label="昵称"
          min-width="150"
        />
        <el-table-column
          prop="password"
          label="密码"
          width="120"
        >
          <template #default="scope">
            <span class="password-field">{{ scope.row.password }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="avatar"
          label="头像"
          width="120"
        >
          <template #default="scope">
            <span v-if="scope.row.avatar" class="avatar-field">
              {{ scope.row.avatar.substring(0, 8) }}...
            </span>
            <span v-else class="no-avatar">无头像</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-dropdown
              @command="(command) => handleDropdownCommand(command, scope.row.userId)"
              size="small"
            >
              <el-button type="primary" size="small">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete" style="color: #f56c6c;">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="users.length"
          @size-change="pageSize = $event"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <div class="empty-state" v-else-if="!loading">
      <p>点击上方按钮查询用户列表</p>
    </div>
  </main>
</template>

<style scoped>
.test2-1-view {
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.search-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--text);
}

.header .subtitle {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.query-btn {
  min-width: 80px;
}

.stats-container {
  margin-bottom: 20px;
}

.stats {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: var(--panel);
  border-radius: 8px;
  border: 1px solid var(--line);
}

.stat-item {
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
}

.stat-item:not(:last-child)::after {
  content: "|";
  color: var(--line);
  margin-left: 12px;
}

.content {
  background: var(--panel);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--line);
}

.password-field {
  font-family: monospace;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.avatar-field {
  font-family: monospace;
  font-size: 12px;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.no-avatar {
  color: var(--muted);
  font-size: 12px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
  background: var(--panel);
  border-radius: 8px;
  border: 1px dashed var(--line);
}
</style>
